const BASE_URL = 'https://dataocelotschools.com'

export default function sitemap() {
  const routes = ['', '/privacy', '/login', '/signup']

  return routes.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }))
}
