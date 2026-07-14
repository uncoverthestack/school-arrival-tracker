import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import { demoRequests } from '../schema'

export async function createDemoRequest(data) {
  const [row] = await db.insert(demoRequests).values(data).returning()
  return row
}

export async function getAllDemoRequests() {
  return db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt))
}

export async function setDemoRequestContacted(id, contacted) {
  const [row] = await db.update(demoRequests).set({ contacted }).where(eq(demoRequests.id, id)).returning()
  return row ?? null
}
