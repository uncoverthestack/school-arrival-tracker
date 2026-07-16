import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { DashboardShell } from '../_components/DashboardShell'
import { ThemeToggle } from './ThemeToggle'

export default async function SettingsPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Settings</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          {session.schoolName}
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 max-w-md">
        <p className="text-title-medium tracking-[0.15px] text-on-surface mb-1">Appearance</p>
        <p className="text-body-small tracking-[0.4px] text-on-surface-variant mb-4">
          Choose a light or dark background, or follow your device's setting automatically.
        </p>
        <ThemeToggle />
      </div>
    </DashboardShell>
  )
}
