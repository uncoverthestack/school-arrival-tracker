import { supabase } from '@/lib/supabase'
import { getSchool } from '@/lib/schools'
import { getAdminSession } from '@/lib/session'

async function resolveSchool(request) {
  const session = await getAdminSession()
  if (session.schoolId) return { id: session.schoolId }
  const apiKey = request.headers.get('x-api-key')
  return getSchool(apiKey)
}

export async function GET(request) {
  const school = await resolveSchool(request)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('students')
    .select('id, student_id, name, student_class, parent_name, parent_phone, parent_email, card_id, code, photo_url, created_at')
    .eq('school_id', school.id)
    .order('name')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ students: data })
}

export async function POST(request) {
  const school = await resolveSchool(request)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, studentClass, parentPhone, parentName, parentEmail, cardId, photoUrl } = body

  if (!name || !studentClass || !parentPhone) {
    return Response.json(
      { error: 'name, studentClass, and parentPhone are required' },
      { status: 400 }
    )
  }

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', school.id)

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  const studentId = `SCH-${year}-${seq}`

  // Generate a unique 6-digit code, retry on collision
  let code
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    const { data: clash } = await supabase
      .from('students').select('id').eq('code', candidate).maybeSingle()
    if (!clash) { code = candidate; break }
  }
  if (!code) {
    return Response.json({ error: 'Could not generate unique code, try again' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('students')
    .insert({
      school_id: school.id,
      student_id: studentId,
      name,
      student_class: studentClass,
      parent_name: parentName ?? null,
      parent_phone: parentPhone,
      parent_email: parentEmail ?? null,
      card_id: cardId ?? studentId,
      code,
      photo_url: photoUrl ?? null
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ student: data }, { status: 201 })
}
