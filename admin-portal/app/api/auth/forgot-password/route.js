import { randomBytes } from 'crypto'
import { after } from 'next/server'
import { checkLimit, forgotPasswordLimiter } from '@/lib/ratelimit'
import { getSchoolByAdminEmail } from '@/lib/repo/schools'
import { createPasswordReset } from '@/lib/repo/passwordResets'
import { sendPasswordResetEmail } from '@/lib/email'
import { getRootDomain } from '@/lib/domain'

export async function POST(request) {
  const { allowed } = await checkLimit(forgotPasswordLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many requests. Try again in a few minutes.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  // Always return the same generic message — don't reveal whether the email exists.
  const genericResponse = { success: true, message: "If that email is registered, we've sent a reset link." }

  const school = await getSchoolByAdminEmail(email)
  if (school) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await createPasswordReset({ schoolId: school.id, token, expiresAt })

    const rootDomain = await getRootDomain()
    after(() => sendPasswordResetEmail({
      toEmail: school.adminEmail,
      schoolName: school.name,
      subdomain: school.subdomain,
      token,
      rootDomain,
    }))
  }

  return Response.json(genericResponse)
}
