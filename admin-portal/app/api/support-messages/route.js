import { after } from 'next/server'
import { checkLimit, supportMessageLimiter } from '@/lib/ratelimit'
import { sendSupportMessageNotification } from '@/lib/email'

export async function POST(request) {
  const { allowed } = await checkLimit(supportMessageLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many requests. Try again in a few minutes.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, email, schoolName, message } = body

  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email and message are required' }, { status: 400 })
  }

  const cleanEmail = String(email).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  after(() => sendSupportMessageNotification({
    name: String(name).trim().slice(0, 100),
    email: cleanEmail,
    schoolName: schoolName ? String(schoolName).trim().slice(0, 150) : null,
    message: String(message).trim().slice(0, 2000),
  }))

  return Response.json({ success: true }, { status: 201 })
}
