import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { arrivals, students } from '../schema'

export async function getTodayArrivalByStudent(studentId, type, date) {
  const [row] = await db.select({ id: arrivals.id, scannedAt: arrivals.scannedAt })
    .from(arrivals)
    .where(and(eq(arrivals.studentId, studentId), eq(arrivals.type, type), eq(arrivals.date, date)))
    .limit(1)
  return row ?? null
}

export async function createArrival(data) {
  const [row] = await db.insert(arrivals).values(data).returning()
  return row
}

// Raw, unjoined rows for a school/date — used to compute per-student
// checked-in/out sets and stats (dashboard, messages, alert cron jobs),
// as opposed to getArrivalsBySchoolAndDate's display-joined shape below.
export async function getArrivalRecordsBySchoolAndDate(schoolId, date) {
  return db.select({
    studentId: arrivals.studentId,
    type:      arrivals.type,
    scannedAt: arrivals.scannedAt,
    alertedAt: arrivals.alertedAt,
  })
  .from(arrivals)
  .where(and(eq(arrivals.schoolId, schoolId), eq(arrivals.date, date)))
}

export async function getArrivalsBySchoolAndDate(schoolId, date, { limit } = {}) {
  let q = db.select({
    id:           arrivals.id,
    type:         arrivals.type,
    scannedAt:    arrivals.scannedAt,
    studentName:  students.name,
    studentClass: students.studentClass,
    studentId:    students.studentId,
    photoUrl:     students.photoUrl,
  })
  .from(arrivals)
  .leftJoin(students, eq(arrivals.studentId, students.id))
  .where(and(eq(arrivals.schoolId, schoolId), eq(arrivals.date, date)))
  .orderBy(desc(arrivals.scannedAt))

  if (limit) q = q.limit(limit)

  const rows = await q
  return rows.map(r => ({
    id:           r.id,
    type:         r.type,
    scannedAt:    r.scannedAt,
    time: new Date(r.scannedAt).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
    }),
    name:         r.studentName ?? '—',
    studentClass: r.studentClass ?? '—',
    studentId:    r.studentId ?? null,
    photoUrl:     r.photoUrl ?? null,
  }))
}

export async function countArrivalsToday(schoolId, date) {
  const [{ n }] = await db.select({ n: sql`count(*)::int` })
    .from(arrivals)
    .where(and(eq(arrivals.schoolId, schoolId), eq(arrivals.date, date), eq(arrivals.type, 'arrival')))
  return n ?? 0
}

export async function deleteArrivalsBySchool(schoolId) {
  await db.delete(arrivals).where(eq(arrivals.schoolId, schoolId))
}

export async function deleteArrivalsByStudent(studentId) {
  await db.delete(arrivals).where(eq(arrivals.studentId, studentId))
}
