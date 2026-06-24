import { getSuperSession } from '@/lib/superSession'

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

  // Use same error message for wrong email or password to prevent enumeration
  if (
    String(email).trim().toLowerCase() !== adminEmail.toLowerCase() ||
    String(password) !== adminPassword
  ) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const session = await getSuperSession()
  session.isSuperAdmin = true
  await session.save()

  return Response.json({ success: true })
}
