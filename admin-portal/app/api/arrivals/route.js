import { supabase } from '@/lib/supabase'
import { getSchool } from '@/lib/schools'
import { getAdminSession } from '@/lib/session'

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

  const { data, error } = await supabase
    .from('arrivals')
    .select(`
      id,
      type,
      scanned_at,
      students (
        student_id,
        name,
        student_class
      )
    `)
    .eq('school_id', school.id)
    .eq('date', date)
    .order('scanned_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const arrivals = data.map(a => ({
    id: a.id,
    type: a.type,
    scannedAt: a.scanned_at,
    time: new Date(a.scanned_at).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
    }),
    name: a.students?.name,
    studentClass: a.students?.student_class,
    studentId: a.students?.student_id
  }))

  return Response.json({ arrivals, date })
}
