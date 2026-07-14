import { after } from 'next/server'
import { checkLimit, demoRequestLimiter } from '@/lib/ratelimit'
import { createDemoRequest } from '@/lib/repo/demoRequests'
import { sendDemoRequestNotification } from '@/lib/email'

export async function POST(request) {
  const { allowed } = await checkLimit(demoRequestLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many requests. Try again in a few minutes.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { firstName, lastName, phone, schoolName, schoolEmail, schoolAddress } = body

  if (!firstName || !lastName || !phone || !schoolName || !schoolEmail || !schoolAddress) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  const cleanEmail = String(schoolEmail).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return Response.json({ error: 'Invalid school email address' }, { status: 400 })
  }

  const demoRequest = await createDemoRequest({
    firstName: String(firstName).trim().slice(0, 100),
    lastName: String(lastName).trim().slice(0, 100),
    phone: String(phone).trim().slice(0, 30),
    schoolName: String(schoolName).trim().slice(0, 150),
    schoolEmail: cleanEmail,
    schoolAddress: String(schoolAddress).trim().slice(0, 300),
  })

  after(() => sendDemoRequestNotification(demoRequest))

  return Response.json({ success: true }, { status: 201 })
}
