import { supabase } from '@/lib/supabase'
import { notifyParent } from '@/lib/notify'

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.GATE_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
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

  // Look up student by card_id (RFID UID) or student_id (QR code value)
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .or(`card_id.eq.${cardId},student_id.eq.${cardId}`)
    .single()

  if (!student) {
    return Response.json({ error: 'Student not found', cardId }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Check for duplicate scan of same type today
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
      student: { name: student.name, studentClass: student.student_class },
      message: `Already scanned at ${time}`
    })
  }

  // Log the event
  await supabase.from('arrivals').insert({
    student_id: student.id,
    type,
    date: today
  })

  const time = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
  })

  // Fire notifications without blocking the response
  if (student.parent_phone) {
    notifyParent(student.parent_phone, student.name, type, time).catch(console.error)
  }

  return Response.json({
    success: true,
    student: { name: student.name, studentClass: student.student_class },
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`
  })
}
