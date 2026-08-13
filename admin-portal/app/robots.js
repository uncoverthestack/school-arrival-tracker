import { ROOT_DOMAIN } from '@/lib/domain'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/superadmin', '/students', '/settings', '/gate'],
      },
    ],
    sitemap: `https://${ROOT_DOMAIN}/sitemap.xml`,
  }
}
