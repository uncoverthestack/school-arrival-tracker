import { eq, and, isNull, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { watchlistEntries, students, parents } from '../schema'

export async function createWatchlistEntry({ schoolId, studentId, reason, date }) {
  const [row] = await db.insert(watchlistEntries).values({ schoolId, studentId, reason, date }).returning()
  return row
}

// Open (unresolved) entries, most recently flagged first, joined with the
// student and their parent's phone for display on the Watchlist page.
export async function getOpenWatchlistEntriesBySchool(schoolId) {
  const rows = await db.select({
    id:           watchlistEntries.id,
    reason:       watchlistEntries.reason,
    date:         watchlistEntries.date,
    flaggedAt:    watchlistEntries.flaggedAt,
    studentId:    students.id,
    studentName:  students.name,
    studentClass: students.studentClass,
    parentPhone:  parents.phone,
  })
  .from(watchlistEntries)
  .innerJoin(students, eq(watchlistEntries.studentId, students.id))
  .leftJoin(parents, eq(students.parentId, parents.id))
  .where(and(eq(watchlistEntries.schoolId, schoolId), isNull(watchlistEntries.resolvedAt)))
  .orderBy(desc(watchlistEntries.flaggedAt))

  return rows
}

export async function countOpenWatchlistEntriesBySchool(schoolId) {
  const [{ n }] = await db.select({ n: sql`count(*)::int` })
    .from(watchlistEntries)
    .where(and(eq(watchlistEntries.schoolId, schoolId), isNull(watchlistEntries.resolvedAt)))
  return n ?? 0
}

export async function resolveWatchlistEntry(id, schoolId) {
  const [row] = await db.update(watchlistEntries)
    .set({ resolvedAt: new Date() })
    .where(and(eq(watchlistEntries.id, id), eq(watchlistEntries.schoolId, schoolId)))
    .returning()
  return row ?? null
}
