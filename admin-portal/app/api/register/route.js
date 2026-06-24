import { supabase } from '@/lib/supabase'
import { checkLimit, registerLimiter } from '@/lib/ratelimit'

const LAMBDA_URL = process.env.NOTIFY_LAMBDA_URL
const LAMBDA_API_KEY = process.env.NOTIFY_LAMBDA_API_KEY

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{7,15}$/.test(String(phone).trim())
}

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-\(\)]/g, '')
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendOtp(phone, otp) {
  if (!LAMBDA_URL) return { sent: false }
  await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': LAMBDA_API_KEY },
    body: JSON.stringify({ phone, otp })
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

  const safePhone = String(parentPhone).trim().slice(0, 20)
  if (!isValidPhone(safePhone)) {
    return Response.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, name, student_class, parent_phone')
    .eq('code', safeCode)
    .single()

  if (!student) {
    return Response.json({ error: 'Invalid code — check with your school' }, { status: 404 })
  }

  // School must pre-register the parent phone when adding the student
  if (!student.parent_phone) {
    return Response.json(
      { error: 'No parent contact on file for this student. Ask the school office to register your number first.' },
      { status: 403 }
    )
  }

  // Submitted phone must exactly match what the school registered — prevents students entering their own number
  if (normalizePhone(student.parent_phone) !== normalizePhone(safePhone)) {
    return Response.json(
      { error: 'Phone number does not match school records for this student. Contact the school office.' },
      { status: 403 }
    )
  }

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { data: verification } = await supabase
    .from('verifications')
    .insert({ student_id: student.id, phone: safePhone, otp, expires_at: expiresAt })
    .select('id')
    .single()

  const { sent } = await sendOtp(safePhone, otp)

  return Response.json({
    pending: true,
    verificationId: verification.id,
    studentName: student.name,
    // Only include otp in non-production for local testing
    ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    message: sent
      ? `A verification code has been sent to ${safePhone}`
      : `SMS not configured — use devOtp: ${otp} to verify`
  })
}
