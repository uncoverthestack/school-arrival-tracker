import { getSchoolById } from './schools'
import { getStudentsBySchool } from './students'
import { getArrivalRecordsBySchoolAndDate } from './arrivals'

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
  const [allStudents, arrivalsToday] = await Promise.all([
    getStudentsBySchool(schoolId),
    getArrivalRecordsBySchoolAndDate(schoolId, today),
  ])

  const arrivedIds = new Set(arrivalsToday.filter(a => a.type === 'arrival').map(a => a.studentId))
  const departedIds = new Set(arrivalsToday.filter(a => a.type === 'departure').map(a => a.studentId))

  const notCheckedIn = isPastCutoff(school.arrivalCutoffHour, school.arrivalCutoffMinute)
    ? allStudents.filter(s => !s.usesBus && !arrivedIds.has(s.id)).length
    : 0

  const notCheckedOut = isPastCutoff(school.departureCutoffHour, school.departureCutoffMinute)
    ? allStudents.filter(s => !s.usesBus && arrivedIds.has(s.id) && !departedIds.has(s.id)).length
    : 0

  const paymentDue = school.paymentDueAt ? 1 : 0

  return notCheckedIn + notCheckedOut + paymentDue
}
