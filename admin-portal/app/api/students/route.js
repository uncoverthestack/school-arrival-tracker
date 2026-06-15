import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('students')
    .select('id, student_id, name, student_class, parent_name, parent_phone, parent_email, card_id, created_at')
    .order('name')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ students: data })
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, studentClass, parentPhone, parentName, parentEmail, cardId } = body

  if (!name || !studentClass || !parentPhone) {
    return Response.json(
      { error: 'name, studentClass, and parentPhone are required' },
      { status: 400 }
    )
  }

  // Auto-generate student_id in SCH-YYYY-NNNN format
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  const studentId = `SCH-${year}-${seq}`

  const { data, error } = await supabase
    .from('students')
    .insert({
      student_id: studentId,
      name,
      student_class: studentClass,
      parent_name: parentName ?? null,
      parent_phone: parentPhone,
      parent_email: parentEmail ?? null,
      card_id: cardId ?? studentId   // default card_id to student_id for QR use
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ student: data }, { status: 201 })
}
