import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getStudentsBySchool } from '@/lib/repo/students'
import { getClassesBySchool } from '@/lib/repo/classes'
import { getMessagesCount } from '@/lib/repo/messages'
import { DashboardShell } from '../_components/DashboardShell'
import StudentsClient from './StudentsClient'

export default async function StudentsPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const [students, classes, messagesCount] = await Promise.all([
    getStudentsBySchool(session.schoolId),
    getClassesBySchool(session.schoolId),
    getMessagesCount(session.schoolId),
  ])

  return (
    <DashboardShell messagesCount={messagesCount}>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Students</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          {students.length} student{students.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      <StudentsClient students={students} classes={classes} />
    </DashboardShell>
  )
}
