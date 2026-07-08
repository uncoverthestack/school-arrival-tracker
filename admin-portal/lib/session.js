import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const secret = process.env.SESSION_SECRET
if (!secret || secret.length < 32) {
  throw new Error('SESSION_SECRET env var must be set to a random string of 32+ characters')
}

const sessionOptions = {
  password: secret,
  cookieName: 'sp-admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8 // 8 hours
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  return getIronSession(cookieStore, sessionOptions)
}
