export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/superadmin', '/students', '/settings', '/gate'],
      },
    ],
    sitemap: 'https://dataocelotschools.com/sitemap.xml',
  }
}
