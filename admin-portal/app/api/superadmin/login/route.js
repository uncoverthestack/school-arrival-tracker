import { timingSafeEqual } from 'crypto'
import { getSuperSession } from '@/lib/superSession'

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) {
    // Still run a comparison to avoid leaking length via timing
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email, password } = body

  const adminEmail = process.env.SUPER_ADMIN_EMAIL
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return Response.json({ error: 'Super admin not configured' }, { status: 500 })
  }

  const emailMatch    = safeCompare(String(email).trim().toLowerCase(), adminEmail.toLowerCase())
  const passwordMatch = safeCompare(String(password), adminPassword)

  // Use same error message for wrong email or password to prevent enumeration
  if (!emailMatch || !passwordMatch) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const session = await getSuperSession()
  session.isSuperAdmin = true
  await session.save()

  return Response.json({ success: true })
}
