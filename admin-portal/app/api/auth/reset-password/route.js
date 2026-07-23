import bcrypt from 'bcryptjs'
import { getPasswordResetByToken, markPasswordResetUsed } from '@/lib/repo/passwordResets'
import { updateSchool } from '@/lib/repo/schools'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { token, newPassword } = body
  if (!token || !newPassword) {
    return Response.json({ error: 'token and newPassword are required' }, { status: 400 })
  }

  if (String(newPassword).length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const reset = await getPasswordResetByToken(token)
  if (!reset) {
    return Response.json({ error: 'Invalid or expired reset link' }, { status: 404 })
  }
  if (reset.used) {
    return Response.json({ error: 'This reset link has already been used' }, { status: 410 })
  }
  if (new Date(reset.expiresAt) < new Date()) {
    return Response.json({ error: 'This reset link has expired. Request a new one.' }, { status: 410 })
  }

  const adminPasswordHash = await bcrypt.hash(String(newPassword), 10)

  await Promise.all([
    updateSchool(reset.schoolId, { adminPasswordHash }),
    markPasswordResetUsed(reset.id),
  ])

  return Response.json({ success: true })
}
