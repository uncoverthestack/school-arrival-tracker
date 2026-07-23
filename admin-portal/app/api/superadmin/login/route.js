import { getSuperSession } from '@/lib/superSession'
import { safeCompare } from '@/lib/safeCompare'
import { checkLimit, superAdminLoginLimiter } from '@/lib/ratelimit'

export async function POST(request) {
  const { allowed } = await checkLimit(superAdminLoginLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

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
