import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db'
import { classes } from '../schema'

export async function getClassesBySchool(schoolId) {
  return db.select().from(classes).where(eq(classes.schoolId, schoolId))
    .orderBy(asc(classes.level), asc(classes.arm))
}

export async function isClassTaken(schoolId, level, arm) {
  const [row] = await db.select({ id: classes.id }).from(classes)
    .where(and(eq(classes.schoolId, schoolId), eq(classes.level, level), eq(classes.arm, arm)))
    .limit(1)
  return !!row
}

export async function createClass({ schoolId, level, arm }) {
  const [row] = await db.insert(classes).values({ schoolId, level, arm }).returning()
  return row
}

export async function deleteClass(id, schoolId) {
  await db.delete(classes).where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
}
