import { getSuperSession } from '@/lib/superSession'
import { setDemoRequestContacted } from '@/lib/repo/demoRequests'

export async function PATCH(request) {
  const session = await getSuperSession()
  if (!session.isSuperAdmin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updated = await setDemoRequestContacted(id, !!body.contacted)
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ demoRequest: updated })
}
