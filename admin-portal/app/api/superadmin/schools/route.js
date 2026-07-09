import { supabase } from '@/lib/supabase'
import { getSuperSession } from '@/lib/superSession'

async function authorize() {
  const session = await getSuperSession()
  return session.isSuperAdmin === true
}

export async function GET() {
  if (!await authorize()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, subdomain, admin_email, status, archived_at, created_at')
    .order('created_at', { ascending: false })

  if (!schools) return Response.json({ schools: [] })

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
  return Response.json({
    schools: schools.map(s => ({ ...s, studentCount: countMap[s.id] ?? 0 }))
  })
}

// Suspend, restore, or archive a school
export async function PATCH(request) {
  if (!await authorize()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get('id')
  if (!schoolId) return Response.json({ error: 'id is required' }, { status: 400 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, paymentDays } = body // 'approve' | 'reject' | 'suspend' | 'restore' | 'archive'
  const validActions = ['approve', 'reject', 'suspend', 'restore', 'archive']
  if (!validActions.includes(action)) {
    return Response.json({ error: 'action must be approve, reject, suspend, restore, or archive' }, { status: 400 })
  }

  // Reject — only valid for pending schools; deletes the record and frees the subdomain
  if (action === 'reject') {
    const { data: school } = await supabase
      .from('schools').select('status').eq('id', schoolId).maybeSingle()
    if (!school) return Response.json({ error: 'School not found' }, { status: 404 })
    if (school.status !== 'pending') {
      return Response.json({ error: 'Only pending schools can be rejected' }, { status: 400 })
    }
    await supabase.from('schools').delete().eq('id', schoolId)
    return Response.json({ success: true, action: 'reject' })
  }

  const now = new Date()
  const daysUntilDue = Number(paymentDays) > 0 ? Number(paymentDays) : 30
  const paymentDueAt = new Date(now.getTime() + daysUntilDue * 24 * 60 * 60 * 1000).toISOString()

  // On approve, verify no other active school has claimed this subdomain in the meantime
  if (action === 'approve') {
    const { data: schoolToApprove } = await supabase
      .from('schools').select('subdomain').eq('id', schoolId).maybeSingle()
    if (schoolToApprove) {
      const { data: conflict } = await supabase
        .from('schools')
        .select('id')
        .eq('subdomain', schoolToApprove.subdomain)
        .eq('status', 'active')
        .neq('id', schoolId)
        .maybeSingle()
      if (conflict) {
        return Response.json(
          { error: 'Another active school already holds this subdomain. Reject or reassign it first.' },
          { status: 409 }
        )
      }
    }
  }

  const updates =
    action === 'approve'  ? { status: 'active',    archived_at: null, payment_approved_at: now.toISOString(), payment_due_at: paymentDueAt, pending_expires_at: null } :
    action === 'suspend'  ? { status: 'suspended', archived_at: null } :
    action === 'restore'  ? { status: 'active',    archived_at: null } :
    /* archive */           { status: 'archived',   archived_at: now.toISOString() }

  const { error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', schoolId)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true, action })
}

// Hard delete — only for schools that are already archived
export async function DELETE(request) {
  if (!await authorize()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get('id')
  if (!schoolId) return Response.json({ error: 'id is required' }, { status: 400 })

  // Safety: only allow hard delete on archived schools
  const { data: school } = await supabase
    .from('schools').select('status').eq('id', schoolId).maybeSingle()

  if (!school) return Response.json({ error: 'School not found' }, { status: 404 })
  if (school.status !== 'archived') {
    return Response.json(
      { error: 'Archive the school first before permanently deleting it' },
      { status: 400 }
    )
  }

  const studentIds = await supabase
    .from('students').select('id').eq('school_id', schoolId)
    .then(({ data }) => (data ?? []).map(s => s.id))

  if (studentIds.length > 0) {
    await supabase.from('verifications').delete().in('student_id', studentIds)
  }
  await supabase.from('arrivals').delete().eq('school_id', schoolId)
  await supabase.from('students').delete().eq('school_id', schoolId)
  await supabase.from('schools').delete().eq('id', schoolId)

  return Response.json({ success: true })
}
