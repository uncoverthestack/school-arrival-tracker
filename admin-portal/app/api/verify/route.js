import { supabase } from '@/lib/supabase'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { verificationId, otp, parentName } = body
  if (!verificationId || !otp || !parentName) {
    return Response.json({ error: 'verificationId, otp, and parentName are required' }, { status: 400 })
  }

  const { data: verification } = await supabase
    .from('verifications')
    .select('id, student_id, phone, otp, expires_at, used')
    .eq('id', verificationId)
    .single()

  if (!verification) {
    return Response.json({ error: 'Invalid verification' }, { status: 404 })
  }

  if (verification.used) {
    return Response.json({ error: 'This code has already been used' }, { status: 410 })
  }

  if (new Date(verification.expires_at) < new Date()) {
    return Response.json({ error: 'Verification code has expired. Please register again.' }, { status: 410 })
  }

  if (verification.otp !== String(otp).trim()) {
    return Response.json({ error: 'Incorrect code — check your SMS and try again' }, { status: 400 })
  }

  // Mark used and save parent info
  await Promise.all([
    supabase.from('verifications').update({ used: true }).eq('id', verificationId),
    supabase.from('students')
      .update({ parent_name: String(parentName).trim().slice(0, 100), parent_phone: verification.phone })
      .eq('id', verification.student_id)
  ])

  const { data: student } = await supabase
    .from('students')
    .select('name, student_class')
    .eq('id', verification.student_id)
    .single()

  return Response.json({
    success: true,
    student: { name: student.name, studentClass: student.student_class },
    message: `You will receive notifications for ${student.name}`
  })
}
