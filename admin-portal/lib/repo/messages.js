import { supabase } from '../supabase'
import { getSchoolById } from './schools'

function nowInLagosMinutes() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(new Date())
  const hour = Number(parts.find(p => p.type === 'hour').value)
  const minute = Number(parts.find(p => p.type === 'minute').value)
  return hour * 60 + minute
}

function isPastCutoff(cutoffHour, cutoffMinute) {
  return nowInLagosMinutes() >= cutoffHour * 60 + cutoffMinute
}

// Same "needs a message" rules as the Messages page (payment due/overdue,
// plus students not yet checked in or checked out today) — used to badge
// the sidebar's Messages link from every dashboard page, not just /messages.
export async function getMessagesCount(schoolId) {
  const school = await getSchoolById(schoolId)
  if (!school) return 0

  const today = new Date().toISOString().split('T')[0]
  const [{ data: students }, { data: arrivalsToday }] = await Promise.all([
    supabase.from('students').select('id, uses_bus').eq('school_id', schoolId),
    supabase.from('arrivals').select('student_id, type').eq('school_id', schoolId).eq('date', today),
  ])

  const allStudents = students ?? []
  const arrivedIds = new Set((arrivalsToday ?? []).filter(a => a.type === 'arrival').map(a => a.student_id))
  const departedIds = new Set((arrivalsToday ?? []).filter(a => a.type === 'departure').map(a => a.student_id))

  const notCheckedIn = isPastCutoff(school.arrivalCutoffHour, school.arrivalCutoffMinute)
    ? allStudents.filter(s => !s.uses_bus && !arrivedIds.has(s.id)).length
    : 0

  const notCheckedOut = isPastCutoff(school.departureCutoffHour, school.departureCutoffMinute)
    ? allStudents.filter(s => !s.uses_bus && arrivedIds.has(s.id) && !departedIds.has(s.id)).length
    : 0

  const paymentDue = school.paymentDueAt ? 1 : 0

  return notCheckedIn + notCheckedOut + paymentDue
}
