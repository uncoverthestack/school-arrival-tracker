import { supabase } from '@/lib/supabase'
import { getAdminSession } from '@/lib/session'

function currentSchoolYear() {
  const now = new Date()
  const year = now.getFullYear()
  // Nigerian school year: September–June. From Sept onwards it's year/year+1
  return now.getMonth() >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

async function generateUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    const { data } = await supabase.from('students').select('id').eq('code', candidate).maybeSingle()
    if (!data) return candidate
  }
  throw new Error('Could not generate unique code')
}

export async function PATCH(request, { params }) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { studentClass, name, photoUrl } = body

  // Fetch current student — must belong to this school
  const { data: student } = await supabase
    .from('students')
    .select('id, student_class, code, code_year')
    .eq('id', id)
    .eq('school_id', session.schoolId)
    .maybeSingle()

  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 })
  }

  const updates = {}

  if (name) updates.name = String(name).trim().slice(0, 100)
  if (photoUrl !== undefined) updates.photo_url = photoUrl || null

  if (studentClass && studentClass !== student.student_class) {
    // Class changed → student is promoted → rotate code
    updates.student_class = studentClass
    updates.code = await generateUniqueCode()
    updates.code_year = currentSchoolYear()
  } else if (studentClass && studentClass === student.student_class) {
    // Same class → student is repeating → keep code, just update year marker
    updates.student_class = studentClass
    updates.code_year = currentSchoolYear()
  }

  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .eq('school_id', session.schoolId)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const rotated = 'code' in updates
  return Response.json({ student: data, codeRotated: rotated })
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Confirm the student belongs to this school before deleting
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', id)
    .eq('school_id', session.schoolId)
    .maybeSingle()

  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 })
  }

  await supabase.from('verifications').delete().eq('student_id', id)
  await supabase.from('arrivals').delete().eq('student_id', id)
  await supabase.from('students').delete().eq('id', id)

  return Response.json({ success: true })
}
