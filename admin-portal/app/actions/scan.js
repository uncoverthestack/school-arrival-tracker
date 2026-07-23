'use server'

import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'
import { findStudentByIdentifier } from '@/lib/repo/students'
import { getTodayArrivalByStudent, createArrival } from '@/lib/repo/arrivals'

function sanitizeId(cardId) {
  return String(cardId ?? '').trim().replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 50)
}

function toStudentInfo(student) {
  return {
    name: student.name,
    studentClass: student.studentClass,
    studentId: student.studentId,
    photoUrl: student.photoUrl ?? null,
  }
}

export async function lookupStudent(code, schoolKey) {
  const safeId = sanitizeId(code)
  if (!safeId) return { error: 'invalid_input' }

  const school = await getSchool(schoolKey)
  if (!school) return { error: 'unauthorized' }

  const student = await findStudentByIdentifier(safeId, school.id)
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

  const student = await findStudentByIdentifier(safeId, school.id)
  if (!student) return { error: 'not_found', cardId }

  const today = new Date().toISOString().split('T')[0]
  const existing = await getTodayArrivalByStudent(student.id, type, today)
  const studentInfo = toStudentInfo(student)

  if (existing) {
    const time = new Date(existing.scannedAt).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
    })
    return { duplicate: true, student: studentInfo, time, message: `Already checked in at ${time}` }
  }

  await createArrival({ studentId: student.id, schoolId: school.id, type, date: today })

  const time = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
  })

  if (student.parent?.phone) {
    notifyParent(student.parent.phone, student.name, type, time).catch(console.error)
  }

  return {
    success: true,
    student: studentInfo,
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`,
  }
}
