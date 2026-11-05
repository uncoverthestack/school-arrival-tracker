import { lookupStudent } from '@/app/actions/scan'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const apiKey = request.headers.get('x-api-key')
  const { code } = body

  const result = await lookupStudent(code, apiKey)

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
