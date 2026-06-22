import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'

async function getStudents(schoolId) {
  const { data } = await supabase
    .from('students')
    .select('id, name, student_class, student_id, code, parent_phone, photo_url')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })
  return data ?? []
}

export default async function StudentsPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const students = await getStudents(session.schoolId)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-gray-400 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
        </div>

        {students.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center">
            <p className="text-gray-500 text-sm">No students enrolled yet.</p>
            <p className="text-gray-600 text-xs mt-2">Add students via the API: POST /api/students</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-900">
                  <th className="text-left px-6 py-4 w-14"></th>
                  <th className="text-left px-6 py-4">Name</th>
                  <th className="text-left px-6 py-4 hidden md:table-cell">Student ID</th>
                  <th className="text-left px-6 py-4 hidden sm:table-cell">Class</th>
                  <th className="text-left px-6 py-4">Gate Code</th>
                  <th className="text-left px-6 py-4 hidden lg:table-cell">Parent Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-base font-bold text-indigo-300">
                          {s.name?.[0] ?? '?'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs hidden md:table-cell">
                      {s.student_id ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                      {s.student_class ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-lg font-bold tracking-widest text-indigo-400">
                        {s.code ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
                      {s.parent_phone ?? <span className="text-gray-600 italic">not registered</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
