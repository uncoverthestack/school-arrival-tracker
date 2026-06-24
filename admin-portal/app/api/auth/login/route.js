import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import { checkLimit, loginLimiter } from '@/lib/ratelimit'

export async function POST(request) {
  const { allowed } = await checkLimit(loginLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many login attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email, password, schoolKey } = body
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Resolve school via middleware header (subdomain) or explicit schoolKey from body
  const { headers } = request
  const keyFromMiddleware = headers.get('x-school-key')
  const resolvedKey = keyFromMiddleware || schoolKey

  if (!resolvedKey) {
    return Response.json({ error: 'Could not identify school. Access via your school URL.' }, { status: 400 })
  }

  const { data: school } = await supabase
    .from('schools')
    .select('id, name, api_key, admin_email, admin_password_hash, status')
    .eq('api_key', resolvedKey)
    .single()

  // Use same error for wrong email or wrong school to avoid enumeration
  if (!school || school.admin_email !== email.trim().toLowerCase()) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (school.status === 'suspended') {
    return Response.json(
      { error: 'Your account has been suspended. Please contact support to restore access.' },
      { status: 403 }
    )
  }

  if (school.status === 'archived') {
    return Response.json({ error: 'This account no longer exists.' }, { status: 403 })
  }

  const valid = await bcrypt.compare(password, school.admin_password_hash)
  if (!valid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const session = await getAdminSession()
  session.schoolId = school.id
  session.schoolName = school.name
  session.schoolKey = school.api_key
  await session.save()

  return Response.json({ success: true, school: school.name })
}
