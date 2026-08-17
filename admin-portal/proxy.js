import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSubdomain(host) {
  const hostname = host.split(':')[0]
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null
  const parts = hostname.split('.')
  // Need subdomain.domain.tld (3+ parts), skip www and Vercel preview URLs
  if (parts.length < 3) return null
  if (parts[0] === 'www') return null
  if (hostname.endsWith('.vercel.app')) return null
  return parts[0]
}

export async function proxy(request) {
  const host = request.headers.get('host') ?? ''
  const subdomain = getSubdomain(host)

  if (!subdomain) return NextResponse.next()

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/schools?subdomain=eq.${encodeURIComponent(subdomain)}&select=id,name,api_key,status&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    )

    const schools = await res.json()
    const school = schools?.[0]

    // Not a registered school subdomain, or suspended/archived — pass through without setting school key
    if (!school || school.status !== 'active') return NextResponse.next()

    const response = NextResponse.next()

    // Server components read this header
    response.headers.set('x-school-key', school.api_key)
    response.headers.set('x-school-name', school.name)

    // Kept as a backup for any server-side reader that isn't in the request-header
    // path — httpOnly since nothing client-side should ever need the raw API key.
    // The gate kiosk UI and the login route both resolve it via the x-school-key
    // header instead.
    response.cookies.set('school-key', school.api_key, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8
    })

    return response
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
