'use server'

import { supabase } from '@/lib/supabase'
import { notifyParent } from '@/lib/notify'

export async function scanCard(cardId, type) {
  if (!cardId || !['arrival', 'departure'].includes(type)) {
    return { error: 'invalid_input' }
  }

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .or(`card_id.eq.${cardId},student_id.eq.${cardId}`)
    .maybeSingle()

  if (!student) {
    return { error: 'not_found', cardId }
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('arrivals')
    .select('id, scanned_at')
    .eq('student_id', student.id)
    .eq('type', type)
    .eq('date', today)
    .maybeSingle()

  const studentInfo = {
    name: student.name,
    studentClass: student.student_class,
    photoUrl: student.photo_url ?? null
  }

  if (existing) {
    const time = new Date(existing.scanned_at).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
    })
    return { duplicate: true, student: studentInfo, message: `Already scanned at ${time}` }
  }

  await supabase.from('arrivals').insert({ student_id: student.id, type, date: today })

  const time = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
  })

  if (student.parent_phone) {
    notifyParent(student.parent_phone, student.name, type, time).catch(console.error)
  }

  return {
    success: true,
    student: studentInfo,
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`
  }
}
