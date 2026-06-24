import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const superSessionOptions = {
  password: process.env.SESSION_SECRET ?? 'dev-only-secret-32-chars-minimum!!',
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
