import { getAdminSession } from '@/lib/session'
import { resolveWatchlistEntry } from '@/lib/repo/watchlist'

export async function PATCH(request, { params }) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const entry = await resolveWatchlistEntry(id, session.schoolId)
  if (!entry) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ entry })
}
