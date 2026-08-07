import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { getOpenWatchlistEntriesBySchool } from '@/lib/repo/watchlist'
import { getMessagesCount } from '@/lib/repo/messages'
import { DashboardShell } from '../_components/DashboardShell'
import WatchlistClient from './WatchlistClient'

export default async function WatchlistPage() {
  const session = await getAdminSession()
  if (!session.schoolId) redirect('/login')

  const [entries, messagesCount] = await Promise.all([
    getOpenWatchlistEntriesBySchool(session.schoolId),
    getMessagesCount(session.schoolId),
  ])

  return (
    <DashboardShell watchlistCount={entries.length} messagesCount={messagesCount}>
      <div className="mb-8">
        <h1 className="text-headline-small text-on-surface">Watchlist</h1>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          Students flagged for not checking in or out by cutoff — parents are notified automatically when they're added here.
        </p>
      </div>

      <WatchlistClient entries={entries} />
    </DashboardShell>
  )
}
