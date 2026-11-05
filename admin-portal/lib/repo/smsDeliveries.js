import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import { smsDeliveries } from '../schema'

export async function recordSmsSubmitted({ provider, messageId, brand, phone, kind }) {
  const [row] = await db.insert(smsDeliveries)
    .values({ provider, messageId, brand, phone, kind, status: 'submitted' })
    // A provider that reuses or omits a message id must not break the send path.
    .onConflictDoNothing({ target: smsDeliveries.messageId })
    .returning()
  return row ?? null
}

/**
 * Applies a provider delivery report. Returns false when the message id is unknown,
 * which is the signal that the webhook fired for something we never recorded —
 * worth logging rather than silently accepting.
 */
export async function applySmsDeliveryReport(messageId, { status, providerStatus, failureReason }) {
  const [row] = await db.update(smsDeliveries)
    .set({ status, providerStatus, failureReason, updatedAt: new Date() })
    .where(eq(smsDeliveries.messageId, messageId))
    .returning()
  return row ?? null
}

export async function getRecentSmsFailures(limit = 50) {
  return db.select().from(smsDeliveries)
    .where(eq(smsDeliveries.status, 'failed'))
    .orderBy(desc(smsDeliveries.createdAt))
    .limit(limit)
}
