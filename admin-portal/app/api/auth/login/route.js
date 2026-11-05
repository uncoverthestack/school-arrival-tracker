import bcrypt from 'bcryptjs'
import { getAdminSession } from '@/lib/session'
import { checkLimit, loginLimiter } from '@/lib/ratelimit'
import { getSchoolByApiKeyFull,
  getSchoolByAdminEmail, getSchoolBySubdomain } from '@/lib/repo/schools'

// Local dev only — lets any teammate log into a fixed seeded test school
// without needing a subdomain or a `?key=` URL param. Never active in a
// real deployment: Vercel always sets NODE_ENV=production, including previews.
const DEV_TEST_SUBDOMAIN = 'devtest'

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

  const { email, password } = body
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Resolved from the httpOnly school-key cookie set by proxy.js from the
  // request's Host header — never trust a client-supplied key here, since that
  // would mean handing the school's full-access API key to the browser just to
  // route a login request. Note: the x-school-key *header* proxy.js also sets
  // doesn't reach this route — proxy.js's matcher excludes /api/*, so a plain
  // fetch('/api/auth/login') never passes through it. The cookie does travel
  // with the request regardless (httpOnly only blocks JS access to it, not the
  // browser's automatic cookie transmission), so it's the one to read here.
  const resolvedKey = request.cookies.get('school-key')?.value

  let school = null
  if (resolvedKey) {
    school = await getSchoolByApiKeyFull(resolvedKey)
  } else {
    // No subdomain context — the admin reached the apex domain rather than their
    // school URL. adminEmail is unique across schools, so it identifies the school
    // on its own. This only selects which record to check; the password comparison
    // below is unchanged, so it grants nothing a correct password would not.
    school = await getSchoolByAdminEmail(email.trim().toLowerCase())
    if (!school && process.env.NODE_ENV !== 'production') {
      school = await getSchoolBySubdomain(DEV_TEST_SUBDOMAIN)
    }
  }

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
  session.schoolKey = school.apiKey
  session.schoolType = school.schoolType ?? 'primary'
  await session.save()

  return Response.json({ success: true, school: school.name })
}
