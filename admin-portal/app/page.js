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
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{session.schoolName}</h1>
            <p className="text-gray-400 mt-1">{today}</p>
          </div>
          <RefreshTicker />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Arrived Today</p>
            <p className="text-3xl font-bold mt-1 text-green-400">{stats.arrivedToday}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Not Yet Arrived</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">{stats.notArrived}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Arrivals</h2>
          {arrivals.length === 0 ? (
            <p className="text-gray-500 text-sm">No arrivals recorded today yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-3 w-12"></th>
                  <th className="text-left pb-3">Student</th>
                  <th className="text-left pb-3 hidden md:table-cell">Class</th>
                  <th className="text-left pb-3 hidden sm:table-cell">Time</th>
                  <th className="text-left pb-3">Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {arrivals.map(a => (
                  <tr key={a.id}>
                    <td className="py-3 pr-3">
                      {a.photoUrl ? (
                        <img src={a.photoUrl} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-base font-bold text-white shrink-0">
                          {a.name?.[0] ?? '?'}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <p className="font-medium">{a.name}</p>
                      {a.studentId && <p className="text-xs text-gray-500">{a.studentId}</p>}
                    </td>
                    <td className="py-3 text-gray-400 hidden md:table-cell">{a.cls}</td>
                    <td className="py-3 text-gray-400 hidden sm:table-cell">{a.time}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        a.type === 'arrival' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'
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
