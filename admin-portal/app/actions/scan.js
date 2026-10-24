'use server'

import { headers } from 'next/headers'
import { after } from 'next/server'
import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'
import { findStudentByIdentifier, getEnrolledFaceDescriptors } from '@/lib/repo/students'
import { getTodayArrivalByStudent, createArrival } from '@/lib/repo/arrivals'
import { deriveCodePrefix } from '@/lib/codePrefix'

// The gate kiosk's own UI resolves its school from the x-school-key request
// header — set server-side by proxy.js from the subdomain, never handed to
// client JS — instead of trusting a key the browser passes in. Third-party
// integrations hitting the documented /api/* routes directly still use their
// own stored API key via the x-api-key header; this is only for our kiosk UI.
async function resolveSchool() {
  const key = (await headers()).get('x-school-key')
  return getSchool(key)
}

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

export async function getFaceDescriptors() {
  const school = await resolveSchool()
  if (!school) return { error: 'unauthorized' }

  const students = await getEnrolledFaceDescriptors(school.id)
  return { students }
}

export async function lookupStudent(code) {
  const safeId = sanitizeId(code)
  if (!safeId) return { error: 'invalid_input' }

  const school = await resolveSchool()
  if (!school) return { error: 'unauthorized' }

  const student = await findStudentByIdentifier(safeId, school.id)
  if (!student) return { error: 'not_found', cardId: code }

  return { student: toStudentInfo(student), codePrefix: school.codePrefix ?? deriveCodePrefix(school.name) }
}

export async function scanCard(cardId, type) {
  if (!cardId || !['arrival', 'departure'].includes(type)) {
    return { error: 'invalid_input' }
  }

  const safeId = sanitizeId(cardId)
  if (!safeId) return { error: 'invalid_input' }

  const school = await resolveSchool()
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
    // after() keeps the function alive until the notification finishes. Without it the
    // serverless instance freezes the moment the response is sent, suspending the
    // in-flight request to the SMS provider — alerts then arrive minutes late when a
    // later request happens to thaw the same instance, or never arrive at all, while
    // the gate screen still says "parent notified".
    after(() => notifyParent(student.parent.phone, student.name, type, time, school.name).catch(console.error))
  }

  return {
    success: true,
    student: studentInfo,
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`,
  }
}
