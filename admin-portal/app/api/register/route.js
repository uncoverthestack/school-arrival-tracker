import { checkLimit, registerLimiter } from '@/lib/ratelimit'
import { getStudentByCode } from '@/lib/repo/students'
import { createVerification } from '@/lib/repo/verifications'
import { toE164 } from '@/lib/validation'

const LAMBDA_URL = process.env.NOTIFY_LAMBDA_URL
const LAMBDA_API_KEY = process.env.NOTIFY_LAMBDA_API_KEY

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendOtp(phone, otp) {
  if (!LAMBDA_URL) return { sent: false }
  await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': LAMBDA_API_KEY },
    body: JSON.stringify({ phone, otp }),
  })
  return { sent: true }
}

export async function POST(request) {
  const { allowed } = await checkLimit(registerLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { code, parentName, parentPhone } = body

  if (!code || !parentName || !parentPhone) {
    return Response.json({ error: 'code, parentName, and parentPhone are required' }, { status: 400 })
  }

  const safeCode = String(code).replace(/\D/g, '').slice(0, 6)
  if (safeCode.length < 4) {
    return Response.json({ error: 'Invalid code format' }, { status: 400 })
  }

  const safeName = String(parentName).trim().slice(0, 100)
  if (safeName.length < 2) {
    return Response.json({ error: 'Name is too short' }, { status: 400 })
  }

  const inputPhone = toE164(parentPhone)
  if (!inputPhone) {
    return Response.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const student = await getStudentByCode(safeCode)
  if (!student) {
    return Response.json({ error: 'Invalid code — check with your school' }, { status: 404 })
  }

  if (!student.parent?.phone) {
    return Response.json(
      { error: 'No parent contact on file for this student. Ask the school office to register your number first.' },
      { status: 403 }
    )
  }

  if (toE164(student.parent.phone) !== inputPhone) {
    return Response.json(
      { error: 'Phone number does not match school records for this student. Contact the school office.' },
      { status: 403 }
    )
  }

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  const verification = await createVerification({
    studentId: student.id,
    phone: inputPhone,
    otp,
    expiresAt,
  })

  const { sent } = await sendOtp(inputPhone, otp)

  return Response.json({
    pending: true,
    verificationId: verification.id,
    studentName: student.name,
    ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    message: sent
      ? `A verification code has been sent to ${inputPhone}`
      : `SMS not configured — use devOtp: ${otp} to verify`,
  })
}
