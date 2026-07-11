import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import { DashboardShell } from '../_components/DashboardShell'
import StudentsClient from './StudentsClient'

async function getStudents(schoolId) {
  const { data } = await supabase
    .from('students')
    .select('id, name, student_class, student_id, code, code_year, parent_name, parent_phone, photo_url')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })
  return data ?? []
}

export default async function StudentsPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const students = await getStudents(session.schoolId)

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Students</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          {students.length} student{students.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      <StudentsClient students={students} />
    </DashboardShell>
  )
}
