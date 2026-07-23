import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { parents } from '../schema'
import { toE164 } from '../validation'

export async function getParentById(id) {
  const [row] = await db.select().from(parents).where(eq(parents.id, id)).limit(1)
  return row ?? null
}

// Same phone within a school = same parent. If a matching parent already
// exists, fills in name/email only where they were previously missing —
// editing one sibling's contact info shouldn't silently overwrite another's.
// Returns null if the phone doesn't parse to a valid number.
export async function findOrCreateParent({ schoolId, name, phone, email }) {
  const e164 = toE164(phone)
  if (!e164) return null

  const [existing] = await db.select().from(parents)
    .where(and(eq(parents.schoolId, schoolId), eq(parents.phone, e164)))
    .limit(1)

  if (existing) {
    const patch = {}
    if (name && !existing.name) patch.name = name
    if (email && !existing.email) patch.email = email
    if (Object.keys(patch).length === 0) return existing
    const [updated] = await db.update(parents).set(patch).where(eq(parents.id, existing.id)).returning()
    return updated
  }

  const [created] = await db.insert(parents).values({ schoolId, name: name || null, phone: e164, email: email || null }).returning()
  return created
}

export async function updateParent(id, updates) {
  const [row] = await db.update(parents).set(updates).where(eq(parents.id, id)).returning()
  return row ?? null
}

export async function setParentPhoneVerified(id, verified = true) {
  return updateParent(id, { phoneVerified: verified })
}
