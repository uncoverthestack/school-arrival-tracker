import { redirect } from 'next/navigation'
<<<<<<< HEAD
import Link from 'next/link'
import { getAdminSession } from '@/lib/session'
import { getStudentsBySchool } from '@/lib/repo/students'
=======
import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'
import { DashboardShell } from '../_components/DashboardShell'
>>>>>>> frontend/ui-changes
import StudentsClient from './StudentsClient'

export default async function StudentsPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const students = await getStudentsBySchool(session.schoolId)

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-gray-400 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
        </div>

        <StudentsClient students={students} />

=======
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Students</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          {students.length} student{students.length !== 1 ? 's' : ''} enrolled
        </p>
>>>>>>> frontend/ui-changes
      </div>

      <StudentsClient students={students} />
    </DashboardShell>
  )
}
