import bcrypt from 'bcryptjs'
import { after } from 'next/server'
import { checkLimit, registerLimiter } from '@/lib/ratelimit'
import { randomBytes } from 'crypto'
import {
  isSubdomainTaken,
  isEmailTaken,
  deleteExpiredPendingBySubdomain,
  createSchool,
} from '@/lib/repo/schools'
import { sendSignupConfirmationEmail } from '@/lib/email'

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

  const [subTaken, emailTaken] = await Promise.all([
    isSubdomainTaken(cleanSubdomain),
    isEmailTaken(cleanEmail),
  ])

  if (subTaken) {
    return Response.json({ error: 'That subdomain is already taken' }, { status: 409 })
  }
  if (emailTaken) {
    return Response.json({ error: 'An account with that email already exists' }, { status: 409 })
  }

  // Clean up any expired pending school squatting this subdomain before inserting
  await deleteExpiredPendingBySubdomain(cleanSubdomain)

  const [passwordHash, apiKey] = await Promise.all([
    bcrypt.hash(String(password), 10),
    Promise.resolve(generateApiKey()),
  ])

  let school
  try {
    school = await createSchool({
      name: String(schoolName).trim().slice(0, 100),
      admin_name: String(adminName).trim().slice(0, 100),
      subdomain: cleanSubdomain,
      adminEmail: cleanEmail,
      adminPasswordHash: passwordHash,
      apiKey,
      status: 'pending',
      schoolType: cleanType,
      pendingExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    })
  } catch {
    return Response.json({ error: 'Could not create account. Try again.' }, { status: 500 })
  }

  after(() => sendSignupConfirmationEmail({ toEmail: cleanEmail, schoolName: school.name }))

  // Do not create a session — school is pending approval and has no portal access yet
  return Response.json({
    success: true,
    pending: true,
    subdomain: cleanSubdomain,
    school: school.name,
    message: 'Registration received. You will get access once your payment is confirmed by our team.',
  }, { status: 201 })
}
