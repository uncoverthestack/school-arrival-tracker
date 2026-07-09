import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import RefreshTicker from './RefreshTicker'

async function getStats(schoolId) {
  const today = new Date().toISOString().split('T')[0]
  const [{ count: totalStudents }, { data: todayArrivals }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('arrivals').select('student_id').eq('school_id', schoolId).eq('date', today).eq('type', 'arrival')
  ])
  const arrivedCount = todayArrivals?.length ?? 0
  const total = totalStudents ?? 0
  return { totalStudents: total, arrivedToday: arrivedCount, notArrived: Math.max(0, total - arrivedCount) }
}

async function getRecentArrivals(schoolId) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('arrivals')
    .select('id, type, scanned_at, students(name, student_class, student_id, photo_url)')
    .eq('school_id', schoolId)
    .eq('date', today)
    .order('scanned_at', { ascending: false })
    .limit(20)

  return (data ?? []).map(a => ({
    id: a.id,
    name: a.students?.name ?? '—',
    cls: a.students?.student_class ?? '—',
    studentId: a.students?.student_id ?? null,
    photoUrl: a.students?.photo_url ?? null,
    time: new Date(a.scanned_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }),
    type: a.type
  }))
}

export default async function Dashboard() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Lagos'
  })

  const [stats, arrivals] = await Promise.all([
    getStats(session.schoolId),
    getRecentArrivals(session.schoolId)
  ])

  return (
    <div className="theme-auto font-kiosk min-h-screen bg-surface text-on-surface p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-headline-medium font-bold text-on-surface">{session.schoolName}</h1>
              {session.schoolType && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                  {session.schoolType === 'combined' ? 'Primary + Secondary' : session.schoolType}
                </span>
              )}
            </div>
            <p className="text-body-large tracking-[0.5px] text-on-surface-variant mt-1">{today}</p>
          </div>
          <RefreshTicker />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">Total Students</p>
            <p className="text-headline-medium font-bold text-on-surface mt-1">{stats.totalStudents}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">Arrived Today</p>
            <p className="text-headline-medium font-bold text-success mt-1">{stats.arrivedToday}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">Not Yet Arrived</p>
            <p className="text-headline-medium font-bold text-warning mt-1">{stats.notArrived}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <h2 className="text-title-medium font-medium tracking-[0.15px] text-on-surface mb-4">Recent Arrivals</h2>
          {arrivals.length === 0 ? (
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">No arrivals recorded today yet.</p>
          ) : (
            <table className="w-full text-body-medium tracking-[0.25px]">
              <thead>
                <tr className="text-on-surface-variant border-b border-outline-variant">
                  <th className="text-left pb-3 w-12"></th>
                  <th className="text-left pb-3">Student</th>
                  <th className="text-left pb-3 hidden md:table-cell">Class</th>
                  <th className="text-left pb-3 hidden sm:table-cell">Time</th>
                  <th className="text-left pb-3">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {arrivals.map(a => (
                  <tr key={a.id}>
                    <td className="py-3 pr-3">
                      {a.photoUrl ? (
                        <img src={a.photoUrl} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-base font-bold text-on-surface shrink-0">
                          {a.name?.[0] ?? '?'}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <p className="text-label-large font-medium text-on-surface">{a.name}</p>
                      {a.studentId && <p className="text-body-small tracking-[0.4px] text-on-surface-variant">{a.studentId}</p>}
                    </td>
                    <td className="py-3 text-on-surface-variant hidden md:table-cell">{a.cls}</td>
                    <td className="py-3 text-on-surface-variant hidden sm:table-cell">{a.time}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-label-small font-bold tracking-[0.5px] ${
                        a.type === 'arrival'
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-tertiary-container text-on-tertiary-container'
                      }`}>
                        {a.type === 'arrival' ? 'Arrived' : 'Departed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
