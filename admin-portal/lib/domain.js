// Single source of truth for the app's canonical root domain. Every
// subdomain-based school URL (signup form, superadmin list, emails, sitemap,
// API docs) is built from this instead of a hardcoded string, so switching
// domains — as just happened moving from dataocelotschools.com to
// childmap.org — means changing one env var instead of hunting through the
// codebase. Needs the NEXT_PUBLIC_ prefix since client components (the
// signup form, the superadmin list) read it too.
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'childmap.org'
