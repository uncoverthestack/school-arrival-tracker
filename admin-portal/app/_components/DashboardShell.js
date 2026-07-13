import { Sidebar } from './Sidebar'

export function DashboardShell({ watchlistCount, children }) {
  return (
    <div className="theme-auto font-kiosk flex min-h-screen bg-surface text-on-surface">
      <Sidebar watchlistCount={watchlistCount} />
      <main className="flex-1 flex flex-col gap-8 px-10 py-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
