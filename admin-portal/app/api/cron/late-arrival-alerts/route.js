import { supabase } from '@/lib/supabase'
import { notifyParentAbsent } from '@/lib/notify'

function nowInLagos() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(new Date())
  const hour = Number(parts.find(p => p.type === 'hour').value)
  const minute = Number(parts.find(p => p.type === 'minute').value)
  return { hour, minute, totalMinutes: hour * 60 + minute }
}

export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const { totalMinutes: nowMinutes } = nowInLagos()

  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, name, arrival_cutoff_hour, arrival_cutoff_minute')
    .eq('status', 'active')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const alerted = []

  for (const school of schools ?? []) {
    const cutoffMinutes = school.arrival_cutoff_hour * 60 + school.arrival_cutoff_minute
    if (nowMinutes < cutoffMinutes) continue // this school's cutoff hasn't passed yet today

    const cutoffLabel = `${String(school.arrival_cutoff_hour).padStart(2, '0')}:${String(school.arrival_cutoff_minute).padStart(2, '0')}`

    const [{ data: students }, { data: arrivalsToday }] = await Promise.all([
      supabase.from('students')
        .select('id, name, uses_bus, last_late_alert_date, parents(phone)')
        .eq('school_id', school.id)
        .eq('uses_bus', false),
      supabase.from('arrivals')
        .select('student_id')
        .eq('school_id', school.id)
        .eq('date', today)
        .eq('type', 'arrival'),
    ])

    const arrivedIds = new Set((arrivalsToday ?? []).map(a => a.student_id))

    for (const s of students ?? []) {
      if (arrivedIds.has(s.id)) continue
      if (s.last_late_alert_date === today) continue
      if (!s.parents?.phone) continue

      try {
        await notifyParentAbsent(s.parents.phone, s.name, cutoffLabel)
        await supabase.from('students').update({ last_late_alert_date: today }).eq('id', s.id)
        alerted.push({ school: school.name, student: s.name })
      } catch (err) {
        console.error(`late-arrival alert failed for ${s.name} (${school.name}):`, err.message)
      }
    }
  }

  return Response.json({ alerted })
}
