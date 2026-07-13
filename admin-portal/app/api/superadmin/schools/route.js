<<<<<<< HEAD
import { getSuperSession } from '@/lib/superSession'
import {
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  countStudentsInSchool,
  hasActiveSubdomainConflict,
} from '@/lib/repo/schools'
import { getStudentIdsBySchool, deleteStudentsBySchool } from '@/lib/repo/students'
import { deleteVerificationsByStudentIds } from '@/lib/repo/verifications'
import { deleteArrivalsBySchool } from '@/lib/repo/arrivals'
=======
import { after } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSuperSession } from '@/lib/superSession'
import { sendPaymentConfirmedEmail } from '@/lib/email'
>>>>>>> frontend/ui-changes

async function authorize() {
  const session = await getSuperSession()
  return session.isSuperAdmin === true
}

export async function GET() {
  if (!await authorize()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const schools = await getAllSchools()

  const counts = await Promise.all(schools.map(s => countStudentsInSchool(s.id)))
  const result = schools.map((s, i) => ({ ...s, studentCount: counts[i] }))

  return Response.json({ schools: result })
}

export async function PATCH(request) {
  if (!await authorize()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get('id')
  if (!schoolId) return Response.json({ error: 'id is required' }, { status: 400 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, paymentDays } = body
  const validActions = ['approve', 'reject', 'suspend', 'restore', 'archive']
  if (!validActions.includes(action)) {
    return Response.json({ error: 'action must be approve, reject, suspend, restore, or archive' }, { status: 400 })
  }

  if (action === 'reject') {
    const school = await getSchoolById(schoolId)
    if (!school) return Response.json({ error: 'School not found' }, { status: 404 })
    if (school.status !== 'pending') {
      return Response.json({ error: 'Only pending schools can be rejected' }, { status: 400 })
    }
    await deleteSchool(schoolId)
    return Response.json({ success: true, action: 'reject' })
  }

  const now = new Date()
  const daysUntilDue = Number(paymentDays) > 0 ? Number(paymentDays) : 30
  const paymentDueAt = new Date(now.getTime() + daysUntilDue * 24 * 60 * 60 * 1000)

<<<<<<< HEAD
  if (action === 'approve') {
    const schoolToApprove = await getSchoolById(schoolId)
=======
  // On approve, verify no other active school has claimed this subdomain in the meantime
  let schoolToApprove = null
  if (action === 'approve') {
    const { data } = await supabase
      .from('schools').select('subdomain, name, admin_email, status').eq('id', schoolId).maybeSingle()
    schoolToApprove = data
>>>>>>> frontend/ui-changes
    if (schoolToApprove) {
      const conflict = await hasActiveSubdomainConflict(schoolToApprove.subdomain, schoolId)
      if (conflict) {
        return Response.json(
          { error: 'Another active school already holds this subdomain. Reject or reassign it first.' },
          { status: 409 }
        )
      }
    }
  }

  const updates =
<<<<<<< HEAD
    action === 'approve' ? { status: 'active',    archivedAt: null, paymentApprovedAt: now, paymentDueAt, pendingExpiresAt: null } :
    action === 'suspend' ? { status: 'suspended', archivedAt: null } :
    action === 'restore' ? { status: 'active',    archivedAt: null } :
    /* archive */          { status: 'archived',   archivedAt: now }
=======
    action === 'approve'  ? { status: 'active',    archived_at: null, payment_approved_at: now.toISOString(), payment_due_at: paymentDueAt, pending_expires_at: null, payment_reminder_sent_at: null } :
    action === 'suspend'  ? { status: 'suspended', archived_at: null } :
    action === 'restore'  ? { status: 'active',    archived_at: null } :
    /* archive */           { status: 'archived',   archived_at: now.toISOString() }
>>>>>>> frontend/ui-changes

  const updated = await updateSchool(schoolId, updates)
  if (!updated) return Response.json({ error: 'School not found' }, { status: 404 })

  if (action === 'approve' && schoolToApprove) {
    after(() => sendPaymentConfirmedEmail({
      toEmail: schoolToApprove.admin_email,
      schoolName: schoolToApprove.name,
      subdomain: schoolToApprove.subdomain,
      isRenewal: schoolToApprove.status === 'payment_due',
    }))
  }

  return Response.json({ success: true, action })
}

export async function DELETE(request) {
  if (!await authorize()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get('id')
  if (!schoolId) return Response.json({ error: 'id is required' }, { status: 400 })

  const school = await getSchoolById(schoolId)
  if (!school) return Response.json({ error: 'School not found' }, { status: 404 })
  if (school.status !== 'archived') {
    return Response.json(
      { error: 'Archive the school first before permanently deleting it' },
      { status: 400 }
    )
  }

  const studentIds = await getStudentIdsBySchool(schoolId)
  await deleteVerificationsByStudentIds(studentIds)
  await deleteArrivalsBySchool(schoolId)
  await deleteStudentsBySchool(schoolId)
  await deleteSchool(schoolId)

  return Response.json({ success: true })
}
