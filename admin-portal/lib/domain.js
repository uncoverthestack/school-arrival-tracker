import { headers } from 'next/headers'

// Static fallback for contexts with no incoming request to read a Host header from
// (cron jobs triggered by Vercel's scheduler, not a browser). Everywhere else — pages,
// route handlers — should prefer getRootDomain() below so dataocelotschools.com and
// childmap.org each show their own domain instead of both collapsing onto whichever
// value happened to be baked in at build time.
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'childmap.org'

// Derives the root domain from the current request's Host header, so the same
// deployment correctly reflects dataocelotschools.com (testing) or childmap.org
// (live) — or a preview/localhost host — depending on which one was actually used
// to reach it, instead of a single hardcoded value shared by every domain.
export async function getRootDomain() {
  try {
    const host = (await headers()).get('host')
    return host || ROOT_DOMAIN
  } catch {
    return ROOT_DOMAIN
  }
}
