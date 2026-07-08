import { redirect } from 'next/navigation'
import { getSuperSession } from '@/lib/superSession'
import { LogoutButton, SchoolsTable } from './SuperAdminClient'
import { supabase } from '@/lib/supabase'

async function getAllSchools() {
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, subdomain, admin_email, status, archived_at, payment_due_at, payment_approved_at, created_at')
    .order('created_at', { ascending: false })

  if (!schools || schools.length === 0) return []

  // Auto-expire schools whose payment_due_at has passed
  const now = new Date()
  const expired = schools.filter(
    s => s.status === 'active' && s.payment_due_at && new Date(s.payment_due_at) < now
  )
  if (expired.length > 0) {
    await supabase
      .from('schools')
      .update({ status: 'payment_due' })
      .in('id', expired.map(s => s.id))
    expired.forEach(s => { s.status = 'payment_due' })
  }

  const counts = await Promise.all(
    schools.map(s =>
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', s.id)
        .then(({ count }) => ({ id: s.id, count: count ?? 0 }))
    )
  )

  const countMap = Object.fromEntries(counts.map(c => [c.id, c.count]))
  return schools.map(s => ({ ...s, studentCount: countMap[s.id] ?? 0 }))
}

export default async function SuperAdminPage() {
  const session = await getSuperSession()
  if (!session.isSuperAdmin) redirect('/superadmin/login')

  const schools = await getAllSchools()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🔐</span>
              <h1 className="text-3xl font-bold">Super Admin</h1>
            </div>
            <p className="text-gray-400">{schools.length} school{schools.length !== 1 ? 's' : ''} registered on the platform</p>
          </div>
          <LogoutButton />
        </div>

        <SchoolsTable schools={schools} />

      </div>
    </div>
  )
}
