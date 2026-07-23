import { eq, and, ne, or, gt, lt, inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import { schools, students } from '../schema'

export async function getSchoolByApiKey(apiKey) {
  if (!apiKey) return null
  const [row] = await db.select({ id: schools.id, name: schools.name })
    .from(schools).where(eq(schools.apiKey, apiKey)).limit(1)
  return row ?? null
}

export async function getSchoolByApiKeyFull(apiKey) {
  if (!apiKey) return null
  const [row] = await db.select().from(schools).where(eq(schools.apiKey, apiKey)).limit(1)
  return row ?? null
}

export async function getSchoolById(id) {
  const [row] = await db.select().from(schools).where(eq(schools.id, id)).limit(1)
  return row ?? null
}

export async function getSchoolBySubdomain(subdomain) {
  if (!subdomain) return null
  const [row] = await db.select().from(schools).where(eq(schools.subdomain, subdomain)).limit(1)
  return row ?? null
}

export async function getSchoolByAdminEmail(email) {
  if (!email) return null
  const [row] = await db.select().from(schools).where(eq(schools.adminEmail, email)).limit(1)
  return row ?? null
}

export async function getAllSchools() {
  return db.select().from(schools).orderBy(schools.createdAt)
}

export async function createSchool(data) {
  const [row] = await db.insert(schools).values(data).returning()
  return row
}

export async function updateSchool(id, updates) {
  const [row] = await db.update(schools).set(updates).where(eq(schools.id, id)).returning()
  return row ?? null
}

export async function deleteSchool(id) {
  await db.delete(schools).where(eq(schools.id, id))
}

export async function countStudentsInSchool(schoolId) {
  const [{ n }] = await db.select({ n: sql`count(*)::int` }).from(students).where(eq(students.schoolId, schoolId))
  return n ?? 0
}

// Returns true if the subdomain is already taken by a non-expired school
export async function isSubdomainTaken(subdomain, excludeId = null) {
  const now = new Date()
  const clauses = [
    eq(schools.subdomain, subdomain),
    or(ne(schools.status, 'pending'), gt(schools.pendingExpiresAt, now))
  ]
  if (excludeId) clauses.push(ne(schools.id, excludeId))
  const [row] = await db.select({ id: schools.id }).from(schools).where(and(...clauses)).limit(1)
  return !!row
}

export async function isEmailTaken(email, excludeId = null) {
  const clauses = [eq(schools.adminEmail, email)]
  if (excludeId) clauses.push(ne(schools.id, excludeId))
  const [row] = await db.select({ id: schools.id }).from(schools).where(and(...clauses)).limit(1)
  return !!row
}

export async function deleteExpiredPendingBySubdomain(subdomain) {
  const now = new Date()
  await db.delete(schools).where(
    and(eq(schools.subdomain, subdomain), eq(schools.status, 'pending'), lt(schools.pendingExpiresAt, now))
  )
}

export async function hasActiveSubdomainConflict(subdomain, excludeId) {
  const [row] = await db.select({ id: schools.id }).from(schools)
    .where(and(eq(schools.subdomain, subdomain), eq(schools.status, 'active'), ne(schools.id, excludeId)))
    .limit(1)
  return !!row
}

export async function expireOverdueSchools(ids) {
  if (!ids.length) return
  await db.update(schools).set({ status: 'payment_due' }).where(inArray(schools.id, ids))
}
