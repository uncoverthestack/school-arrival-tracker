import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import StudentsClient from './StudentsClient'

async function getStudents(schoolId) {
  const { data } = await supabase
    .from('students')
    .select('id, name, student_class, student_id, code, code_year, parent_name, parent_phone, photo_url, face_descriptor')
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

        <StudentsClient students={students} />

      </div>
    </div>
  )
}
