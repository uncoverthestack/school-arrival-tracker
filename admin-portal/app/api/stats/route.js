import { supabase } from '@/lib/supabase'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalStudents }, { data: todayArrivals }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase
      .from('arrivals')
      .select('student_id')
      .eq('date', today)
      .eq('type', 'arrival')
  ])

  const arrivedCount = todayArrivals?.length ?? 0
  const total = totalStudents ?? 0
  const notArrivedCount = Math.max(0, total - arrivedCount)

  return Response.json({
    totalStudents: total,
    arrivedToday: arrivedCount,
    notArrived: notArrivedCount,
    date: today
  })
}
