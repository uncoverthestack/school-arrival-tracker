import { ROOT_DOMAIN } from '@/lib/domain'

const BASE_URL = `https://${ROOT_DOMAIN}`

export default function sitemap() {
  const routes = ['', '/about', '/privacy', '/terms', '/login', '/signup']

  return routes.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }))
}
