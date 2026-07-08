'use server'

import { supabase } from '@/lib/supabase'
import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'

// Strip everything except alphanumeric and hyphens to prevent filter injection
function sanitizeId(cardId) {
  return String(cardId ?? '').trim().replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 50)
}

async function findStudent(safeId, school) {
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', school.id)
    .or(`card_id.eq.${safeId},student_id.eq.${safeId},code.eq.${safeId}`)
    .maybeSingle()
  return student
}

function toStudentInfo(student) {
  return {
    name: student.name,
    studentClass: student.student_class,
    studentId: student.student_id,
    photoUrl: student.photo_url ?? null
  }
}

// Read-only lookup for the manual code-entry confirm step — no arrival is
// written and no parent is notified. The actual check-in still goes through
// scanCard once the operator confirms the student shown.
export async function lookupStudent(code, schoolKey) {
  const safeId = sanitizeId(code)
  if (!safeId) return { error: 'invalid_input' }

  const school = await getSchool(schoolKey)
  if (!school) return { error: 'unauthorized' }

  const student = await findStudent(safeId, school)
  if (!student) return { error: 'not_found', cardId: code }

  return { student: toStudentInfo(student) }
}

export async function scanCard(cardId, type, schoolKey) {
  if (!cardId || !['arrival', 'departure'].includes(type)) {
    return { error: 'invalid_input' }
  }

  const safeId = sanitizeId(cardId)
  if (!safeId) return { error: 'invalid_input' }

  const school = await getSchool(schoolKey)
  if (!school) return { error: 'unauthorized' }

  const student = await findStudent(safeId, school)

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

  const studentInfo = toStudentInfo(student)

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
