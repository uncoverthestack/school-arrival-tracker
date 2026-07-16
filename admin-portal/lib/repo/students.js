import { eq, and, or, isNotNull, asc, sql } from 'drizzle-orm'
import { db } from '../db'
import { students } from '../schema'

export async function getStudentsBySchool(schoolId) {
  return db.select().from(students).where(eq(students.schoolId, schoolId)).orderBy(asc(students.name))
}

export async function getStudentById(id, schoolId) {
  const clauses = [eq(students.id, id)]
  if (schoolId) clauses.push(eq(students.schoolId, schoolId))
  const [row] = await db.select().from(students).where(and(...clauses)).limit(1)
  return row ?? null
}

// Matches card_id, student_id, or 6-digit code — the three identifiers the gate accepts
export async function findStudentByIdentifier(identifier, schoolId) {
  const [row] = await db.select().from(students)
    .where(and(
      eq(students.schoolId, schoolId),
      or(
        eq(students.cardId, identifier),
        eq(students.studentId, identifier),
        eq(students.code, identifier)
      )
    ))
    .limit(1)
  return row ?? null
}

export async function getStudentByCode(code) {
  const [row] = await db.select().from(students).where(eq(students.code, code)).limit(1)
  return row ?? null
}

export async function isCodeUnique(code) {
  const [row] = await db.select({ id: students.id }).from(students).where(eq(students.code, code)).limit(1)
  return !row
}

export async function countStudentsBySchool(schoolId) {
  const [{ n }] = await db.select({ n: sql`count(*)::int` }).from(students).where(eq(students.schoolId, schoolId))
  return n ?? 0
}

export async function createStudent(data) {
  const [row] = await db.insert(students).values(data).returning()
  return row
}

export async function updateStudent(id, schoolId, updates) {
  const clauses = [eq(students.id, id)]
  if (schoolId) clauses.push(eq(students.schoolId, schoolId))
  const [row] = await db.update(students).set(updates).where(and(...clauses)).returning()
  return row ?? null
}

export async function deleteStudent(id) {
  await db.delete(students).where(eq(students.id, id))
}

export async function getEnrolledFaceDescriptors(schoolId) {
  return db.select({
    id: students.id,
    name: students.name,
    code: students.code,
    studentId: students.studentId,
    studentClass: students.studentClass,
    photoUrl: students.photoUrl,
    faceDescriptor: students.faceDescriptor,
  })
  .from(students)
  .where(and(eq(students.schoolId, schoolId), isNotNull(students.faceDescriptor)))
}

export async function getStudentIdsBySchool(schoolId) {
  const rows = await db.select({ id: students.id }).from(students).where(eq(students.schoolId, schoolId))
  return rows.map(r => r.id)
}

export async function deleteStudentsBySchool(schoolId) {
  await db.delete(students).where(eq(students.schoolId, schoolId))
}
