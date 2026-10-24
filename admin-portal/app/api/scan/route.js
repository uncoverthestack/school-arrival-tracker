import { after } from 'next/server'
import { notifyParent } from '@/lib/notify'
import { getSchool } from '@/lib/schools'
import { checkLimit, scanLimiter } from '@/lib/ratelimit'
import { findStudentByIdentifier } from '@/lib/repo/students'
import { getTodayArrivalByStudent, createArrival } from '@/lib/repo/arrivals'

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

  const student = await findStudentByIdentifier(safeId, school.id)
  if (!student) {
    return Response.json({ error: 'Student not found', cardId }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]
  const existing = await getTodayArrivalByStudent(student.id, type, today)

  if (existing) {
    const time = new Date(existing.scannedAt).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
    })
    return Response.json({
      duplicate: true,
      student: {
        name: student.name,
        studentClass: student.studentClass,
        studentId: student.studentId,
        photoUrl: student.photoUrl ?? null,
      },
      message: `Already scanned at ${time}`,
    })
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

  return Response.json({
    success: true,
    student: {
      name: student.name,
      studentClass: student.studentClass,
      studentId: student.studentId,
      photoUrl: student.photoUrl ?? null,
    },
    time,
    message: `${type === 'arrival' ? 'Arrived' : 'Departed'} at ${time} — parent notified`,
  })
}
