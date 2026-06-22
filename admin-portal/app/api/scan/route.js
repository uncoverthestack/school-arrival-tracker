import { supabase } from '@/lib/supabase'
import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'
import { checkLimit, scanLimiter } from '@/lib/ratelimit'

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key')
  const school = await getSchool(apiKey)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { allowed } = await checkLimit(scanLimiter, school.id, request)
  if (!allowed) {
    return Response.json({ error: 'Too many scans. Slow down.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cardId, type = 'arrival' } = body
  if (!cardId) {
    return Response.json({ error: 'cardId is required' }, { status: 400 })
  }
  if (!['arrival', 'departure'].includes(type)) {
    return Response.json({ error: 'type must be arrival or departure' }, { status: 400 })
  }

  const safeId = String(cardId).trim().replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 50)
  if (!safeId) {
    return Response.json({ error: 'cardId contains invalid characters' }, { status: 400 })
  }

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', school.id)
    .or(`card_id.eq.${safeId},student_id.eq.${safeId},code.eq.${safeId}`)
    .single()

  if (!student) {
    return Response.json({ error: 'Student not found', cardId }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('arrivals')
    .select('id, scanned_at')
    .eq('student_id', student.id)
    .eq('type', type)
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    const time = new Date(existing.scanned_at).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
    })
    return Response.json({
      duplicate: true,
      student: {
        name: student.name,
        studentClass: student.student_class,
        studentId: student.student_id,
        photoUrl: student.photo_url ?? null
      },
      message: `Already scanned at ${time}`
    })
  }

  await supabase.from('arrivals').insert({
    student_id: student.id,
    school_id: school.id,
    type,
    date: today
  })

  const time = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
  })

  if (student.parent_phone) {
    notifyParent(student.parent_phone, student.name, type, time).catch(console.error)
  }

  return Response.json({
    success: true,
    student: {
      name: student.name,
      studentClass: student.student_class,
      studentId: student.student_id,
      photoUrl: student.photo_url ?? null
    },
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`
  })
}
