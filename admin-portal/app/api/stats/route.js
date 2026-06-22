import { supabase } from '@/lib/supabase'
import { getSchool } from '@/lib/schools'

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key')
  const school = await getSchool(apiKey)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalStudents }, { data: todayArrivals }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
    supabase
      .from('arrivals')
      .select('student_id')
      .eq('school_id', school.id)
      .eq('date', today)
      .eq('type', 'arrival')
  ])

  const arrivedCount = todayArrivals?.length ?? 0
  const total = totalStudents ?? 0
  const notArrivedCount = Math.max(0, total - arrivedCount)

  return Response.json({
    school: school.name,
    totalStudents: total,
    arrivedToday: arrivedCount,
    notArrived: notArrivedCount,
    date: today
  })
}
