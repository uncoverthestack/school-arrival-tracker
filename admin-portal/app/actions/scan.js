'use server'

import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'
import { findStudentByIdentifier } from '@/lib/repo/students'
import { getTodayArrivalByStudent, createArrival } from '@/lib/repo/arrivals'
import { deriveCodePrefix } from '@/lib/codePrefix'

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

  return { student: toStudentInfo(student), codePrefix: school.codePrefix ?? deriveCodePrefix(school.name) }
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

  // Check-in is withheld until the parent has confirmed their own phone via
  // the SMS OTP flow (/api/register + /api/verify) — otherwise a mistyped
  // or unverified number could silently be trusted for pickup notifications.
  if (!student.parent?.phoneVerified) {
    return {
      error: 'unverified',
      student: toStudentInfo(student),
      message: `${student.name}'s parent hasn't verified their phone yet — check-in is blocked until they do`,
    }
  }

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
