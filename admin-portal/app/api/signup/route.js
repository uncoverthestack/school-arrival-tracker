import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import { checkLimit, registerLimiter } from '@/lib/ratelimit'
import { randomBytes } from 'crypto'

function generateApiKey() {
  return randomBytes(24).toString('hex')
}

function isValidSubdomain(value) {
  return /^[a-z0-9][a-z0-9\-]{1,30}[a-z0-9]$/.test(value)
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
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { schoolName, adminName, subdomain, email, password } = body

  if (!schoolName || !adminName || !subdomain || !email || !password) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  const cleanSubdomain = String(subdomain).toLowerCase().trim()
  if (!isValidSubdomain(cleanSubdomain)) {
    return Response.json(
      { error: 'Subdomain must be 3–32 characters, lowercase letters, numbers and hyphens only' },
      { status: 400 }
    )
  }

  const cleanEmail = String(email).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (String(password).length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  // Check subdomain and email availability in parallel
  const [{ data: existingSubdomain }, { data: existingEmail }] = await Promise.all([
    supabase.from('schools').select('id').eq('subdomain', cleanSubdomain).maybeSingle(),
    supabase.from('schools').select('id').eq('admin_email', cleanEmail).maybeSingle()
  ])

  if (existingSubdomain) {
    return Response.json({ error: 'That subdomain is already taken' }, { status: 409 })
  }
  if (existingEmail) {
    return Response.json({ error: 'An account with that email already exists' }, { status: 409 })
  }

  const [passwordHash, apiKey] = await Promise.all([
    bcrypt.hash(String(password), 10),
    Promise.resolve(generateApiKey())
  ])

  const { data: school, error } = await supabase
    .from('schools')
    .insert({
      name: String(schoolName).trim().slice(0, 100),
      admin_name: String(adminName).trim().slice(0, 100),
      subdomain: cleanSubdomain,
      admin_email: cleanEmail,
      admin_password_hash: passwordHash,
      api_key: apiKey
    })
    .select('id, name, admin_name, api_key')
    .single()

  if (error) {
    return Response.json({ error: 'Could not create account. Try again.' }, { status: 500 })
  }

  // Log the school admin in immediately
  const session = await getAdminSession()
  session.schoolId = school.id
  session.schoolName = school.name
  session.adminName = school.admin_name
  session.schoolKey = school.api_key
  await session.save()

  return Response.json({ success: true, subdomain: cleanSubdomain, school: school.name }, { status: 201 })
}
