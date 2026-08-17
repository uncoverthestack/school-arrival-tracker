import { getRootDomain } from '@/lib/domain'

export default async function sitemap() {
  const BASE_URL = `https://${await getRootDomain()}`
  const routes = ['', '/about', '/privacy', '/terms', '/login', '/signup']

  return routes.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }))
}
