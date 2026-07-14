import { getSchool } from '@/lib/schools'
import { countStudentsBySchool } from '@/lib/repo/students'
import { countArrivalsToday } from '@/lib/repo/arrivals'

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key')
  const school = await getSchool(apiKey)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const [total, arrivedCount] = await Promise.all([
    countStudentsBySchool(school.id),
    countArrivalsToday(school.id, today),
  ])

  return Response.json({
    school: school.name,
    totalStudents: total,
    arrivedToday: arrivedCount,
    notArrived: Math.max(0, total - arrivedCount),
    date: today,
  })
}
