import bcrypt from 'bcryptjs'
import { getAdminSession } from '@/lib/session'
import { checkLimit, loginLimiter } from '@/lib/ratelimit'
import { getSchoolByApiKeyFull } from '@/lib/repo/schools'

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

  const { headers } = request
  const keyFromMiddleware = headers.get('x-school-key')
  const resolvedKey = keyFromMiddleware || schoolKey

  if (!resolvedKey) {
    return Response.json({ error: 'Could not identify school. Access via your school URL.' }, { status: 400 })
  }

<<<<<<< HEAD
  const school = await getSchoolByApiKeyFull(resolvedKey)
=======
  const { data: school } = await supabase
    .from('schools')
    .select('id, name, admin_name, api_key, admin_email, admin_password_hash, status, school_type')
    .eq('api_key', resolvedKey)
    .single()
>>>>>>> frontend/ui-changes

  if (!school || school.adminEmail !== email.trim().toLowerCase()) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (school.status === 'pending') {
    return Response.json(
      { error: 'Your account is awaiting payment approval. Please contact DataOcelot Schools to proceed.' },
      { status: 403 }
    )
  }

  if (school.status === 'payment_due') {
    return Response.json(
      { error: 'Your subscription has expired. Please make payment to restore access.' },
      { status: 403 }
    )
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

  const valid = await bcrypt.compare(password, school.adminPasswordHash)
  if (!valid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const session = await getAdminSession()
  session.schoolId = school.id
  session.schoolName = school.name
<<<<<<< HEAD
  session.schoolKey = school.apiKey
  session.schoolType = school.schoolType ?? 'primary'
=======
  session.adminName = school.admin_name
  session.schoolKey = school.api_key
  session.schoolType = school.school_type ?? 'primary'
>>>>>>> frontend/ui-changes
  await session.save()

  return Response.json({ success: true, school: school.name })
}
