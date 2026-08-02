import { getAdminSession } from '@/lib/session'
import { isValidPhone } from '@/lib/validation'
import { getMessagesCount } from '@/lib/repo/messages'
import { getSchoolById } from '@/lib/repo/schools'
import { getStudentsBySchool, getStudentCountsByClass } from '@/lib/repo/students'
import { getClassesBySchool } from '@/lib/repo/classes'
import { getArrivalRecordsBySchoolAndDate } from '@/lib/repo/arrivals'
import RefreshTicker from './RefreshTicker'
import { DashboardShell } from './_components/DashboardShell'
import { ArrivalFlowChart } from './_components/ArrivalFlowChart'
import { LandingPage } from './_components/LandingPage'

const CHART_START_MINUTE = 7 * 60 + 30 // 7:30
const CHART_END_MINUTE = 8 * 60 + 45 // 8:45

// The full list is what the (not-yet-built) Watchlist page will show —
// this card is just a preview.
const ATTENTION_PREVIEW_LIMIT = 5

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

function getGreeting() {
  const { hour } = nowInLagos()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
}

function buildArrivalFlow(arrivalTimestamps) {
  const buckets = []
  for (let m = CHART_START_MINUTE; m <= CHART_END_MINUTE; m += 5) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    buckets.push({ minute: m, label: `${h}:${String(mm).padStart(2, '0')}`, count: 0 })
  }

  for (const scannedAt of arrivalTimestamps) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date(scannedAt))
    const hh = Number(parts.find(p => p.type === 'hour').value)
    const mi = Number(parts.find(p => p.type === 'minute').value)
    const bucketMinute = Math.floor((hh * 60 + mi) / 5) * 5
    const bucket = buckets.find(b => b.minute === bucketMinute)
    if (bucket) bucket.count += 1
  }

  return buckets
}

async function getDashboardData(schoolId) {
  const today = new Date().toISOString().split('T')[0]

  const [school, allStudents, todaysArrivals, classes, classCounts] = await Promise.all([
    getSchoolById(schoolId),
    getStudentsBySchool(schoolId),
    getArrivalRecordsBySchoolAndDate(schoolId, today),
    getClassesBySchool(schoolId),
    getStudentCountsByClass(schoolId),
  ])

  const cutoffHour = school?.arrivalCutoffHour ?? 8
  const cutoffMinute = school?.arrivalCutoffMinute ?? 15

  const arrivalRows = todaysArrivals.filter(a => a.type === 'arrival')
  const departureRows = todaysArrivals.filter(a => a.type === 'departure')

  const totalStudents = allStudents.length
  const arrivedToday = arrivalRows.length
  const departedToday = departureRows.length
  const alertsSentToday = todaysArrivals.filter(a => a.alertedAt).length
  const pastCutoff = isPastCutoff(cutoffHour, cutoffMinute)
  const unaccounted = pastCutoff ? Math.max(0, totalStudents - arrivedToday) : 0
  const percentArrived = totalStudents > 0 ? Math.round((arrivedToday / totalStudents) * 100) : 0
  const percentDeparted = totalStudents > 0 ? Math.round((departedToday / totalStudents) * 100) : 0

  const arrivedStudentIds = new Set(arrivalRows.map(a => a.studentId))

  // Needs attention: not-yet-arrived (only once past cutoff, and never for bus
  // riders — their arrival depends on the route, not a fixed gate time) +
  // invalid phone format. A student in both gets the invalid-phone flag,
  // since that's a data-quality issue independent of today's attendance.
  const attention = new Map()
  if (pastCutoff) {
    for (const s of allStudents) {
      if (!s.usesBus && !arrivedStudentIds.has(s.id)) attention.set(s.id, { student: s, reason: 'not_arrived' })
    }
  }
  for (const s of allStudents) {
    if (!isValidPhone(s.parent?.phone)) attention.set(s.id, { student: s, reason: 'invalid_phone' })
  }
  const needsAttention = [...attention.values()].sort((a, b) => a.student.name.localeCompare(b.student.name))

  const arrivalFlow = buildArrivalFlow(arrivalRows.map(a => a.scannedAt))

  // Class breakdown: every configured class (JSS1A, JSS1B, ...) shown with its
  // enrollment, including classes with zero students — plus an "Other" bucket
  // for any student whose class label doesn't match a configured class (e.g.
  // legacy data), so the numbers always add up to totalStudents.
  const countByLabel = new Map(classCounts.map(c => [c.studentClass, c.count]))
  const classBreakdown = classes.map(c => {
    const label = `${c.level}${c.arm}`
    return { label, count: countByLabel.get(label) ?? 0 }
  })
  const knownLabels = new Set(classes.map(c => `${c.level}${c.arm}`))
  const otherCount = classCounts
    .filter(c => !knownLabels.has(c.studentClass))
    .reduce((sum, c) => sum + c.count, 0)
  if (otherCount > 0) classBreakdown.push({ label: 'Other', count: otherCount })

  return {
    totalStudents, arrivedToday, departedToday, unaccounted, alertsSentToday, percentArrived, percentDeparted,
    needsAttention, arrivalFlow, cutoffHour, cutoffMinute, classBreakdown
  }
}

export default async function Home() {
  const session = await getAdminSession()
  if (!session.schoolId) return <LandingPage />

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', timeZone: 'Africa/Lagos'
  })

  const [data, messagesCount] = await Promise.all([
    getDashboardData(session.schoolId),
    getMessagesCount(session.schoolId),
  ])
  const displayName = session.adminName || session.schoolName

  return (
    <DashboardShell watchlistCount={data.needsAttention.length} messagesCount={messagesCount}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-headline-small text-on-surface">{getGreeting()}, {displayName}</p>
              {session.schoolType && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                  {session.schoolType === 'combined' ? 'Primary + Secondary' : session.schoolType}
                </span>
              )}
            </div>
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
              {session.schoolName} · {dateLabel}
            </p>
          </div>
          <div className="flex items-center gap-3.5">
            <RefreshTicker />
            <div className="bg-primary-container flex items-center justify-center rounded-full size-10 shrink-0">
              <span className="text-label-large tracking-[0.1px] text-on-primary-container">
                {getInitials(displayName)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <MetricCard
            label="Checked in" value={data.arrivedToday} sublabel={`${data.percentArrived}% of expected`}
            bg="bg-success-container" text="text-on-success-container" iconBg="bg-success" iconText="text-on-success"
            icon={<path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
          />
          <MetricCard
            label="Checked out" value={data.departedToday} sublabel={`${data.percentDeparted}% of expected`}
            bg="bg-secondary-container" text="text-on-secondary-container" iconBg="bg-secondary" iconText="text-on-secondary"
            icon={<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l4-4-4-4M14 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
          />
          <MetricCard
            label="Expected" value={data.totalStudents} sublabel="enrolled today"
            bg="bg-primary-container" text="text-on-primary-container" iconBg="bg-primary" iconText="text-on-primary"
            icon={<><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="17" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M15.5 15.3c2.3.3 4 1.8 4 4.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></>}
          />
          <MetricCard
            label="Unaccounted" value={data.unaccounted} sublabel={`cutoff ${data.cutoffHour}:${String(data.cutoffMinute).padStart(2, '0')}`}
            bg="bg-warning-container" text="text-on-warning-container" iconBg="bg-warning" iconText="text-on-warning"
            icon={<path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
          />
          <MetricCard
            label="Alerts sent" value={data.alertsSentToday} sublabel="to parents"
            bg="bg-tertiary-container" text="text-on-tertiary-container" iconBg="bg-tertiary" iconText="text-on-tertiary"
            icon={<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
          />
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div>
            <p className="text-title-medium tracking-[0.15px] text-on-surface">Arrival flow</p>
            <p className="text-body-small tracking-[0.4px] text-on-surface-variant">check-ins per 5 minutes</p>
          </div>
          <ArrivalFlowChart data={data.arrivalFlow} />
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div>
            <p className="text-title-medium tracking-[0.15px] text-on-surface">Class breakdown</p>
            <p className="text-body-small tracking-[0.4px] text-on-surface-variant">Enrollment by class</p>
          </div>

          {data.classBreakdown.length === 0 ? (
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant py-2">
              No classes configured yet — set them up from the Students page.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {data.classBreakdown.map(c => (
                <div key={c.label} className="rounded-lg bg-surface-container p-4 flex flex-col gap-1">
                  <p className="text-label-large tracking-[0.1px] text-on-surface-variant truncate">{c.label}</p>
                  <p className="text-headline-small font-bold text-on-surface">{c.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-title-medium tracking-[0.15px] text-on-surface">Needs attention</p>
            {/* Not built yet — visual only, matching the Figma sidebar's Watchlist entry. */}
            <span className="text-label-large tracking-[0.1px] text-primary">View watchlist</span>
          </div>

          {data.needsAttention.length === 0 ? (
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant py-2">
              Nothing to flag right now.
            </p>
          ) : (
            <div className="flex flex-col">
              {data.needsAttention.slice(0, ATTENTION_PREVIEW_LIMIT).map(({ student, reason }, i, arr) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 px-2 py-4 ${i < arr.length - 1 ? 'border-b border-outline-variant/50' : ''}`}
                >
                  <div className="bg-primary-container flex items-center justify-center rounded-full size-10 shrink-0">
                    <span className="text-label-large tracking-[0.1px] text-on-primary-container">
                      {getInitials(student.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-large tracking-[0.5px] text-on-surface truncate">{student.name}</p>
                    <p className="text-body-small tracking-[0.4px] text-on-surface-variant truncate">{student.studentClass}</p>
                  </div>
                  {reason === 'invalid_phone' ? (
                    <span className="flex items-center gap-1.5 bg-error-container text-on-error-container text-body-small rounded-full px-3 py-2 shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Invalid phone number
                    </span>
                  ) : (
                    <p className="text-label-large tracking-[0.1px] text-on-surface-variant shrink-0">Not yet arrived</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </DashboardShell>
  )
}

function MetricCard({ label, value, sublabel, bg, text, iconBg, iconText, icon }) {
  return (
    <div className={`${bg} ${text} flex gap-3.5 p-6 rounded-lg flex-1`}>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <p className="text-label-large tracking-[0.1px]">{label}</p>
        <p className="text-headline-large font-bold">{value}</p>
        <p className="text-body-small tracking-[0.4px]">{sublabel}</p>
      </div>
      <div className={`${iconBg} ${iconText} flex items-center justify-center rounded-md size-12 shrink-0`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">{icon}</svg>
      </div>
    </div>
  )
}
