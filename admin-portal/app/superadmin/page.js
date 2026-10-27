import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSuperSession } from '@/lib/superSession'
import { LogoutButton, SchoolsTable } from './SuperAdminClient'
import { getAllSchools, countStudentsInSchool, expireOverdueSchools } from '@/lib/repo/schools'
import { getAllDemoRequests } from '@/lib/repo/demoRequests'
import { getRootDomain } from '@/lib/domain'

async function getSchoolsWithCounts() {
  const schools = await getAllSchools()
  if (!schools.length) return []

  // Auto-expire schools whose payment_due_at has passed
  const now = new Date()
  const expired = schools.filter(
    s => s.status === 'active' && s.paymentDueAt && new Date(s.paymentDueAt) < now
  )
  if (expired.length > 0) {
    await expireOverdueSchools(expired.map(s => s.id))
    expired.forEach(s => { s.status = 'payment_due' })
  }

  const counts = await Promise.all(schools.map(s => countStudentsInSchool(s.id)))
  return schools.map((s, i) => ({ ...s, studentCount: counts[i] }))
}

export default async function SuperAdminPage() {
  const session = await getSuperSession()
  if (!session.isSuperAdmin) redirect('/superadmin/login')

  const [schools, demoRequests, rootDomain] = await Promise.all([getSchoolsWithCounts(), getAllDemoRequests(), getRootDomain()])
  const pendingDemoRequests = demoRequests.filter(r => !r.contacted).length

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🔐</span>
              <h1 className="text-3xl font-bold">Super Admin</h1>
            </div>
            <p className="text-gray-400">{schools.length} school{schools.length !== 1 ? 's' : ''} registered on the platform</p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/superadmin/demo-requests" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              Demo Requests
              {pendingDemoRequests > 0 && (
                <span className="bg-yellow-900/50 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">{pendingDemoRequests}</span>
              )}
            </Link>
            <LogoutButton />
          </div>
        </div>

        <SchoolsTable schools={schools} rootDomain={rootDomain} />

      </div>
    </div>
  )
}
