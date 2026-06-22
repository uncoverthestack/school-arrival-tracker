import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const sessionOptions = {
  password: process.env.SESSION_SECRET ?? 'dev-only-secret-32-chars-minimum!!',
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
