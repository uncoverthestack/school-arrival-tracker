import { eq } from 'drizzle-orm'
import { db } from '../db'
import { passwordResets } from '../schema'

export async function createPasswordReset({ schoolId, token, expiresAt }) {
  const [row] = await db.insert(passwordResets).values({ schoolId, token, expiresAt }).returning()
  return row
}

export async function getPasswordResetByToken(token) {
  const [row] = await db.select().from(passwordResets).where(eq(passwordResets.token, token)).limit(1)
  return row ?? null
}

export async function markPasswordResetUsed(id) {
  await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, id))
}
