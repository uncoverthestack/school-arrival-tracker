import { getRootDomain } from '@/lib/domain'

export default async function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/superadmin', '/students', '/settings', '/gate'],
      },
    ],
    sitemap: `https://${await getRootDomain()}/sitemap.xml`,
  }
}
