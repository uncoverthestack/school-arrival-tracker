import { eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { verifications } from '../schema'

export async function createVerification(data) {
  const [row] = await db.insert(verifications).values(data).returning()
  return row
}

export async function getVerificationById(id) {
  const [row] = await db.select().from(verifications).where(eq(verifications.id, id)).limit(1)
  return row ?? null
}

export async function markVerificationUsed(id) {
  await db.update(verifications).set({ used: true }).where(eq(verifications.id, id))
}

export async function deleteVerificationsByStudent(studentId) {
  await db.delete(verifications).where(eq(verifications.studentId, studentId))
}

export async function deleteVerificationsByStudentIds(studentIds) {
  if (!studentIds.length) return
  await db.delete(verifications).where(inArray(verifications.studentId, studentIds))
}
