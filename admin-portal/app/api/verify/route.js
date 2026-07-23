import { getVerificationById, markVerificationUsed } from '@/lib/repo/verifications'
import { getStudentById } from '@/lib/repo/students'
import { updateParent } from '@/lib/repo/parents'
import { safeCompare } from '@/lib/safeCompare'
import { checkLimit, verifyOtpLimiter } from '@/lib/ratelimit'

export async function POST(request) {
  const { allowed } = await checkLimit(verifyOtpLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

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

  if (!safeCompare(verification.otp, String(otp).trim())) {
    return Response.json({ error: 'Incorrect code — check your SMS and try again' }, { status: 400 })
  }

  const student = await getStudentById(verification.studentId, null)
  if (!student?.parent) {
    // Shouldn't happen — /api/register only issues a verification once a
    // matching parent record already exists — but fail loudly if it does.
    return Response.json({ error: 'No parent contact on file for this student' }, { status: 409 })
  }

  const cleanName = String(parentName).trim().slice(0, 100)

  await Promise.all([
    markVerificationUsed(verificationId),
    updateParent(student.parent.id, { name: cleanName, phoneVerified: true }),
  ])

  return Response.json({
    success: true,
    student: { name: student.name, studentClass: student.studentClass },
    message: `You will receive notifications for ${student.name}`,
  })
}
