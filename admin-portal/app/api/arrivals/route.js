import { getSchool } from '@/lib/schools'
import { getAdminSession } from '@/lib/session'
import { getArrivalsBySchoolAndDate } from '@/lib/repo/arrivals'

export async function GET(request) {
  const session = await getAdminSession()
  const school = session.schoolId
    ? { id: session.schoolId }
    : await getSchool(request.headers.get('x-api-key'))

  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const arrivals = await getArrivalsBySchoolAndDate(school.id, date)
  return Response.json({ arrivals, date })
}
