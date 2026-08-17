import { scanCard } from '@/app/actions/scan'
import { getSchool } from '@/lib/schools'
import { checkLimit, scanLimiter } from '@/lib/ratelimit'

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key')
  const school = await getSchool(apiKey)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { allowed } = await checkLimit(scanLimiter, school.id, request)
  if (!allowed) {
    return Response.json({ error: 'Too many scans. Slow down.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cardId, type = 'arrival' } = body

  const result = await scanCard(cardId, type, apiKey)

  if (result.error === 'unauthorized') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (result.error === 'not_found') {
    return Response.json(result, { status: 404 })
  }
  if (result.error === 'invalid_input') {
    return Response.json(result, { status: 400 })
  }

  return Response.json(result)
}
