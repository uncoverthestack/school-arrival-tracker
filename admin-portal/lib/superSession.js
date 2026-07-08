import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const secret = process.env.SESSION_SECRET
if (!secret || secret.length < 32) {
  throw new Error('SESSION_SECRET env var must be set to a random string of 32+ characters')
}

const superSessionOptions = {
  password: secret,
  cookieName: 'sp-super',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 4 // 4 hours
  }
}

export async function getSuperSession() {
  const cookieStore = await cookies()
  return getIronSession(cookieStore, superSessionOptions)
}
