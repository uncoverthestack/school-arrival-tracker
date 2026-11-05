import { getActiveSchools } from '@/lib/repo/schools'
import { getStudentsBySchool, updateStudent } from '@/lib/repo/students'
import { getArrivalRecordsBySchoolAndDate } from '@/lib/repo/arrivals'
import { createWatchlistEntry } from '@/lib/repo/watchlist'
import { notifyParentNotCheckedOut } from '@/lib/notify'

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

  const schools = await getActiveSchools()

  const alerted = []

  for (const school of schools) {
    const cutoffMinutes = school.departureCutoffHour * 60 + school.departureCutoffMinute
    if (nowMinutes < cutoffMinutes) continue // this school's departure cutoff hasn't passed yet today

    const cutoffLabel = `${String(school.departureCutoffHour).padStart(2, '0')}:${String(school.departureCutoffMinute).padStart(2, '0')}`

    const [allStudents, arrivalsToday] = await Promise.all([
      getStudentsBySchool(school.id),
      getArrivalRecordsBySchoolAndDate(school.id, today),
    ])

    const students = allStudents.filter(s => !s.usesBus)
    const arrivedIds = new Set(arrivalsToday.filter(a => a.type === 'arrival').map(a => a.studentId))
    const departedIds = new Set(arrivalsToday.filter(a => a.type === 'departure').map(a => a.studentId))

    for (const s of students) {
      if (!arrivedIds.has(s.id)) continue // never checked in today — not a "forgot to check out" case
      if (departedIds.has(s.id)) continue // already checked out
      if (s.lastLateDepartureAlertDate === today) continue
      if (!s.parent?.phone) continue

      try {
        await notifyParentNotCheckedOut(s.parent.phone, s.name, cutoffLabel, school.name)
        await updateStudent(s.id, school.id, { lastLateDepartureAlertDate: today })
        await createWatchlistEntry({ schoolId: school.id, studentId: s.id, reason: 'not_departed', date: today })
        alerted.push({ school: school.name, student: s.name })
      } catch (err) {
        console.error(`late-departure alert failed for ${s.name} (${school.name}):`, err.message)
      }
    }
  }

  return Response.json({ alerted })
}
