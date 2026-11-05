import { createHmac } from 'crypto'
import { safeCompare } from '@/lib/safeCompare'
import { applySmsDeliveryReport } from '@/lib/repo/smsDeliveries'

// Sendchamp delivery reports land here. Register the URL in the Sendchamp dashboard
// with the shared secret appended:
//   https://childmap.org/api/webhooks/sendchamp?token=<SENDCHAMP_WEBHOOK_SECRET>
//
// The endpoint is public, so it is authenticated two ways: the URL token above
// (always required) and, if SENDCHAMP_WEBHOOK_SIGNING_KEY is set, an HMAC-SHA256 over
// the raw body. Sendchamp's signature header name is not documented publicly, so the
// HMAC check only engages once you set both the key and SENDCHAMP_SIGNATURE_HEADER to
// whatever header your account actually sends. Until then the token is the gate.
const WEBHOOK_SECRET = process.env.SENDCHAMP_WEBHOOK_SECRET
const SIGNING_KEY = process.env.SENDCHAMP_WEBHOOK_SIGNING_KEY
const SIGNATURE_HEADER = process.env.SENDCHAMP_SIGNATURE_HEADER

// Sendchamp's own status vocabulary varies by channel and version, so map loosely onto
// our three terminal states rather than storing whatever arrives. The raw string is
// kept in provider_status either way.
function normalizeStatus(raw) {
  const s = String(raw || '').toLowerCase()
  if (['delivered', 'delivery_success', 'success', 'sent'].includes(s)) return 'delivered'
  if (['expired', 'timeout'].includes(s)) return 'expired'
  if (['failed', 'delivery_failed', 'rejected', 'undelivered', 'error', 'dnd_rejected'].includes(s)) return 'failed'
  return null
}

export async function POST(request) {
  if (!WEBHOOK_SECRET) {
    console.error('SENDCHAMP_WEBHOOK_SECRET not set — refusing webhook')
    return Response.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const token = new URL(request.url).searchParams.get('token')
  if (!token || !safeCompare(token, WEBHOOK_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Read the body as text first: an HMAC has to be computed over the exact bytes sent,
  // not over a re-serialized object.
  const raw = await request.text()

  if (SIGNING_KEY && SIGNATURE_HEADER) {
    const sent = request.headers.get(SIGNATURE_HEADER)
    const expected = createHmac('sha256', SIGNING_KEY).update(raw).digest('hex')
    if (!sent || !safeCompare(sent, expected)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let body
  try {
    body = JSON.parse(raw || '{}')
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Delivery reports may arrive singly or batched, and the payload is sometimes
  // wrapped in a `data` envelope like the send response.
  const events = Array.isArray(body) ? body : Array.isArray(body.data) ? body.data : [body.data ?? body]

  const results = []
  for (const event of events) {
    if (!event || typeof event !== 'object') continue

    const messageId = event.message_id || event.id || event.reference || event.sms_id
    const rawStatus = event.status || event.delivery_status || event.message_status
    const status = normalizeStatus(rawStatus)

    if (!messageId) {
      console.warn('Sendchamp webhook event has no message id:', Object.keys(event).join(','))
      results.push({ status: 'ignored', reason: 'no message id' })
      continue
    }
    if (!status) {
      // An unmapped status is a reason to extend normalizeStatus, not to drop the
      // event silently — log the literal so it can be added.
      console.warn(`Sendchamp webhook: unmapped status "${rawStatus}" for ${messageId}`)
      results.push({ messageId, status: 'ignored', reason: `unmapped status "${rawStatus}"` })
      continue
    }

    const row = await applySmsDeliveryReport(messageId, {
      status,
      providerStatus: rawStatus ? String(rawStatus) : null,
      failureReason: event.reason || event.failure_reason || event.error || null,
    })

    if (!row) {
      // Fired for a message we never recorded — usually a test send from the
      // dashboard, or a send that predates the delivery log.
      console.warn(`Sendchamp webhook: unknown message id ${messageId}`)
      results.push({ messageId, status: 'unknown' })
      continue
    }

    if (status === 'failed') {
      console.error(`SMS to ${row.phone} failed (${rawStatus}): ${row.failureReason || 'no reason given'}`)
    }
    results.push({ messageId, status })
  }

  // Always 200 on an authenticated, parseable payload — a non-2xx makes Sendchamp
  // retry events we have already processed.
  return Response.json({ received: results.length, results })
}
