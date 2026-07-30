import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getSchoolById } from '@/lib/repo/schools'
import { supabase } from '@/lib/supabase'
import { DashboardShell } from '../_components/DashboardShell'

function nowInLagos() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(new Date())
  const hour = Number(parts.find(p => p.type === 'hour').value)
  const minute = Number(parts.find(p => p.type === 'minute').value)
  return { hour, minute, totalMinutes: hour * 60 + minute }
}

function isPastCutoff(cutoffHour, cutoffMinute) {
  return nowInLagos().totalMinutes >= cutoffHour * 60 + cutoffMinute
}

function formatCutoff(hour, minute) {
  return `${hour}:${String(minute).padStart(2, '0')}`
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
}

async function getMessagesData(schoolId, school) {
  const today = new Date().toISOString().split('T')[0]

  const [{ data: students }, { data: arrivalsToday }] = await Promise.all([
    supabase.from('students').select('id, name, student_class, uses_bus').eq('school_id', schoolId),
    supabase.from('arrivals').select('student_id, type').eq('school_id', schoolId).eq('date', today),
  ])

  const allStudents = students ?? []
  const arrivedIds = new Set((arrivalsToday ?? []).filter(a => a.type === 'arrival').map(a => a.student_id))
  const departedIds = new Set((arrivalsToday ?? []).filter(a => a.type === 'departure').map(a => a.student_id))

  const notCheckedIn = isPastCutoff(school.arrivalCutoffHour, school.arrivalCutoffMinute)
    ? allStudents.filter(s => !s.uses_bus && !arrivedIds.has(s.id))
    : []

  const notCheckedOut = isPastCutoff(school.departureCutoffHour, school.departureCutoffMinute)
    ? allStudents.filter(s => !s.uses_bus && arrivedIds.has(s.id) && !departedIds.has(s.id))
    : []

  let payment = null
  if (school.paymentDueAt) {
    const dueAt = new Date(school.paymentDueAt)
    const daysLeft = Math.ceil((dueAt - new Date()) / (1000 * 60 * 60 * 24))
    payment = { dueAt, daysLeft, overdue: daysLeft < 0 }
  }

  return { notCheckedIn, notCheckedOut, payment }
}

export default async function MessagesPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const school = await getSchoolById(session.schoolId)
  const { notCheckedIn, notCheckedOut, payment } = await getMessagesData(session.schoolId, school)

  const attendanceCount = notCheckedIn.length + notCheckedOut.length
  const messagesCount = attendanceCount + (payment ? 1 : 0)

  return (
    <DashboardShell messagesCount={messagesCount}>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Messages</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          {session.schoolName}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {payment && (
          <div
            className={`rounded-lg p-6 flex items-start gap-4 ${
              payment.overdue ? 'bg-error-container text-on-error-container' : 'bg-warning-container text-on-warning-container'
            }`}
          >
            <div className="flex items-center justify-center rounded-md size-11 shrink-0 bg-current/15">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2.5 8h15" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-title-medium tracking-[0.15px] font-bold">
                {payment.overdue ? 'Payment overdue' : 'Payment due soon'}
              </p>
              <p className="text-body-medium tracking-[0.1px] mt-1">
                {payment.overdue
                  ? `Your subscription payment was due ${payment.dueAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} (${Math.abs(payment.daysLeft)} day${Math.abs(payment.daysLeft) !== 1 ? 's' : ''} ago). Please arrange payment to avoid interruption.`
                  : `Your subscription payment is due ${payment.dueAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} (in ${payment.daysLeft} day${payment.daysLeft !== 1 ? 's' : ''}).`}
              </p>
            </div>
          </div>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div>
            <p className="text-title-medium tracking-[0.15px] text-on-surface">Attendance</p>
            <p className="text-body-small tracking-[0.4px] text-on-surface-variant">
              Students not yet checked in or checked out today
            </p>
          </div>

          {attendanceCount === 0 ? (
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant py-2">
              Nothing to flag right now.
            </p>
          ) : (
            <div className="flex flex-col">
              {[
                ...notCheckedIn.map(s => ({ student: s, reason: 'not_arrived' })),
                ...notCheckedOut.map(s => ({ student: s, reason: 'not_departed' })),
              ].map(({ student, reason }, i, arr) => (
                <div
                  key={`${reason}-${student.id}`}
                  className={`flex items-center gap-4 px-2 py-4 ${i < arr.length - 1 ? 'border-b border-outline-variant/50' : ''}`}
                >
                  <div className="bg-primary-container flex items-center justify-center rounded-full size-10 shrink-0">
                    <span className="text-label-large tracking-[0.1px] text-on-primary-container">
                      {getInitials(student.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-large tracking-[0.5px] text-on-surface truncate">{student.name}</p>
                    <p className="text-body-small tracking-[0.4px] text-on-surface-variant truncate">{student.student_class}</p>
                  </div>
                  <p className="text-label-large tracking-[0.1px] text-on-surface-variant shrink-0">
                    {reason === 'not_arrived'
                      ? `Not checked in (cutoff ${formatCutoff(school.arrivalCutoffHour, school.arrivalCutoffMinute)})`
                      : `Not checked out (cutoff ${formatCutoff(school.departureCutoffHour, school.departureCutoffMinute)})`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
