import { getVerificationById, markVerificationUsed } from '@/lib/repo/verifications'
import { updateStudent, getStudentById } from '@/lib/repo/students'

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

  const verification = await getVerificationById(verificationId)
  if (!verification) {
    return Response.json({ error: 'Invalid verification' }, { status: 404 })
  }

  if (verification.used) {
    return Response.json({ error: 'This code has already been used' }, { status: 410 })
  }

  if (new Date(verification.expiresAt) < new Date()) {
    return Response.json({ error: 'Verification code has expired. Please register again.' }, { status: 410 })
  }

  if (verification.otp !== String(otp).trim()) {
    return Response.json({ error: 'Incorrect code — check your SMS and try again' }, { status: 400 })
  }

  await Promise.all([
    markVerificationUsed(verificationId),
    updateStudent(verification.studentId, null, {
      parentName: String(parentName).trim().slice(0, 100),
      parentPhone: verification.phone,
    }),
  ])

  const student = await getStudentById(verification.studentId, null)

  return Response.json({
    success: true,
    student: { name: student.name, studentClass: student.studentClass },
    message: `You will receive notifications for ${student.name}`,
  })
}
