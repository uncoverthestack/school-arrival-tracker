import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
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

  const { schoolName, adminName, subdomain, email, password, schoolType } = body

  if (!schoolName || !adminName || !subdomain || !email || !password) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  const validTypes = ['primary', 'secondary', 'combined', 'nursery', 'tertiary']
  const cleanType = validTypes.includes(schoolType) ? schoolType : 'primary'

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

  const now = new Date().toISOString()

  // Subdomain is considered taken only if held by a non-pending school,
  // OR by a pending school whose 48-hour reservation has not yet expired.
  const [{ data: existingSubdomain }, { data: existingEmail }] = await Promise.all([
    supabase
      .from('schools')
      .select('id, status, pending_expires_at')
      .eq('subdomain', cleanSubdomain)
      .or(`status.neq.pending,pending_expires_at.gt.${now}`)
      .maybeSingle(),
    supabase.from('schools').select('id').eq('admin_email', cleanEmail).maybeSingle()
  ])

  if (existingSubdomain) {
    const isExpiredPending =
      existingSubdomain.status === 'pending' &&
      existingSubdomain.pending_expires_at &&
      new Date(existingSubdomain.pending_expires_at) < new Date()

    if (!isExpiredPending) {
      return Response.json({ error: 'That subdomain is already taken' }, { status: 409 })
    }
    // Expired pending — clean it up so the new registration can proceed
    await supabase.from('schools').delete().eq('id', existingSubdomain.id)
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
      api_key: apiKey,
      status: 'pending',
      school_type: cleanType,
      pending_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    })
    .select('id, name, admin_name, api_key')
    .single()

  if (error) {
    return Response.json({ error: 'Could not create account. Try again.' }, { status: 500 })
  }

  // Do not create a session — school is pending approval and has no portal access yet
  return Response.json({
    success: true,
    pending: true,
    subdomain: cleanSubdomain,
    school: school.name,
    message: 'Registration received. You will get access once your payment is confirmed by our team.'
  }, { status: 201 })
}
