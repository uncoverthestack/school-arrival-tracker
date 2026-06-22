'use server'

import { supabase } from '@/lib/supabase'
import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'

export async function scanCard(cardId, type, schoolKey) {
  if (!cardId || !['arrival', 'departure'].includes(type)) {
    return { error: 'invalid_input' }
  }

  // Strip everything except alphanumeric and hyphens to prevent filter injection
  const safeId = String(cardId).trim().replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 50)
  if (!safeId) return { error: 'invalid_input' }

  const school = await getSchool(schoolKey)
  if (!school) return { error: 'unauthorized' }

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', school.id)
    .or(`card_id.eq.${safeId},student_id.eq.${safeId},code.eq.${safeId}`)
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
    studentId: student.student_id,
    photoUrl: student.photo_url ?? null
  }

  if (existing) {
    const time = new Date(existing.scanned_at).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
    })
    return { duplicate: true, student: studentInfo, time, message: `Already checked in at ${time}` }
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

  return {
    success: true,
    student: studentInfo,
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`
  }
}
