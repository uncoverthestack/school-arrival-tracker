import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { isValidPhone } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import RefreshTicker from './RefreshTicker'
import { DashboardShell } from './_components/DashboardShell'
import { ArrivalFlowChart } from './_components/ArrivalFlowChart'

// Before this time (Africa/Lagos) nobody is "unaccounted" yet — they just
// haven't arrived. Matches the ARRIVAL_CUTOFF_HOUR-style pattern used for
// the gate scanner's arrival/departure split.
const CUTOFF_HOUR = 8
const CUTOFF_MINUTE = 15

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

function isPastCutoff() {
  return nowInLagos().totalMinutes >= CUTOFF_HOUR * 60 + CUTOFF_MINUTE
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

  const [{ data: students }, { data: arrivals }] = await Promise.all([
    supabase.from('students').select('id, name, student_class, parent_phone').eq('school_id', schoolId),
    supabase.from('arrivals').select('student_id, type, scanned_at, alerted_at').eq('school_id', schoolId).eq('date', today)
  ])

  const allStudents = students ?? []
  const todaysArrivals = arrivals ?? []
  const arrivalRows = todaysArrivals.filter(a => a.type === 'arrival')
  const departureRows = todaysArrivals.filter(a => a.type === 'departure')

  const totalStudents = allStudents.length
  const arrivedToday = arrivalRows.length
  const departedToday = departureRows.length
  const alertsSentToday = todaysArrivals.filter(a => a.alerted_at).length
  const pastCutoff = isPastCutoff()
  const unaccounted = pastCutoff ? Math.max(0, totalStudents - arrivedToday) : 0
  const percentArrived = totalStudents > 0 ? Math.round((arrivedToday / totalStudents) * 100) : 0
  const percentDeparted = totalStudents > 0 ? Math.round((departedToday / totalStudents) * 100) : 0

  const arrivedStudentIds = new Set(arrivalRows.map(a => a.student_id))

  // Needs attention: not-yet-arrived (only once past cutoff) + invalid phone
  // format. A student in both gets the invalid-phone flag, since that's a
  // data-quality issue independent of today's attendance.
  const attention = new Map()
  if (pastCutoff) {
    for (const s of allStudents) {
      if (!arrivedStudentIds.has(s.id)) attention.set(s.id, { student: s, reason: 'not_arrived' })
    }
  }
  for (const s of allStudents) {
    if (!isValidPhone(s.parent_phone)) attention.set(s.id, { student: s, reason: 'invalid_phone' })
  }
  const needsAttention = [...attention.values()].sort((a, b) => a.student.name.localeCompare(b.student.name))

  const arrivalFlow = buildArrivalFlow(arrivalRows.map(a => a.scanned_at))

  return {
    totalStudents, arrivedToday, departedToday, unaccounted, alertsSentToday, percentArrived, percentDeparted,
    needsAttention, arrivalFlow
  }
}

export default async function Dashboard() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', timeZone: 'Africa/Lagos'
  })

  const data = await getDashboardData(session.schoolId)
  const displayName = session.adminName || session.schoolName

  return (
    <DashboardShell watchlistCount={data.needsAttention.length}>
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
            label="Unaccounted" value={data.unaccounted} sublabel={`cutoff ${CUTOFF_HOUR}:${String(CUTOFF_MINUTE).padStart(2, '0')} am`}
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
                    <p className="text-body-small tracking-[0.4px] text-on-surface-variant truncate">{student.student_class}</p>
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
