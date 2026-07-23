import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getSchoolById } from '@/lib/repo/schools'
import { DashboardShell } from '../_components/DashboardShell'
import { ThemeToggle } from './ThemeToggle'
import { AttendanceSettings } from './AttendanceSettings'

export default async function SettingsPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const school = await getSchoolById(session.schoolId)

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Settings</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          {session.schoolName}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 max-w-md">
          <p className="text-title-medium tracking-[0.15px] text-on-surface mb-1">Appearance</p>
          <p className="text-body-small tracking-[0.4px] text-on-surface-variant mb-4">
            Choose a light or dark background, or follow your device&apos;s setting automatically.
          </p>
          <ThemeToggle />
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 max-w-md">
          <p className="text-title-medium tracking-[0.15px] text-on-surface mb-1">Attendance alerts</p>
          <p className="text-body-small tracking-[0.4px] text-on-surface-variant mb-4">
            Set when parents get &quot;not checked in&quot; and &quot;not checked out&quot; alerts. Students marked as bus
            riders (set per-student on the Students page) are exempt from both, since their schedule
            depends on the route rather than a fixed gate time.
          </p>
          <AttendanceSettings
            arrivalCutoffHour={school.arrivalCutoffHour}
            arrivalCutoffMinute={school.arrivalCutoffMinute}
            departureCutoffHour={school.departureCutoffHour}
            departureCutoffMinute={school.departureCutoffMinute}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
