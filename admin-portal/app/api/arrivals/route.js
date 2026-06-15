import { supabase } from '@/lib/supabase'

export async function GET(request) {
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
