import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSuperSession } from '@/lib/superSession'
import { getAllDemoRequests } from '@/lib/repo/demoRequests'
import { LogoutButton } from '../SuperAdminClient'
import { DemoRequestsTable } from './DemoRequestsClient'

export default async function DemoRequestsPage() {
  const session = await getSuperSession()
  if (!session.isSuperAdmin) redirect('/superadmin/login')

  const demoRequests = await getAllDemoRequests()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/superadmin" className="text-sm text-gray-400 hover:text-white transition-colors">← Schools</Link>
            <div className="flex items-center gap-3 mb-1 mt-1">
              <span className="text-2xl">📝</span>
              <h1 className="text-3xl font-bold">Demo Requests</h1>
            </div>
            <p className="text-gray-400">{demoRequests.length} request{demoRequests.length !== 1 ? 's' : ''} received</p>
          </div>
          <LogoutButton />
        </div>

        <DemoRequestsTable demoRequests={demoRequests} />

      </div>
    </div>
  )
}
