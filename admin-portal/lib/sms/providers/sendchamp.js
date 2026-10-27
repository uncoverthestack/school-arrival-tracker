// Sendchamp. Nigeria-native aggregator; the `route` field decides carrier lane:
//   dnd           — corporate route that reaches Do-Not-Disturb registered numbers
//   non_dnd       — cheaper, silently undelivered to anyone on DND
//   international — non-Nigerian destinations
// Endpoint, auth header and body fields confirmed against Sendchamp's own
// sendchamp-sms-go reference implementation.
// The dashboard shows the live base URL as "https://api.sendchamp.com/api/v1/", but the
// send path below already includes /api/v1, so trim both the trailing slash and a
// trailing /api/v1 rather than building "/api/v1//api/v1/sms/send".
const BASE_URL = (process.env.SENDCHAMP_BASE_URL || 'https://api.sendchamp.com')
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '')

export default {
  name: 'sendchamp',

  config: (read) => ({
    apiKey: read('SENDCHAMP_PUBLIC_KEY'),
    route: read('SENDCHAMP_ROUTE', 'dnd')
  }),

  async send({ to, text, senderId, apiKey, route }) {
    if (!apiKey) throw new Error('SENDCHAMP_PUBLIC_KEY not set')

    const res = await fetch(`${BASE_URL}/api/v1/sms/send`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // Sendchamp's own examples send bare MSISDNs without the leading '+'.
        to: [to.replace(/^\+/, '')],
        message: text,
        sender_name: senderId,
        route
      })
    })

    const payload = await res.json().catch(() => ({}))

    // Sendchamp wraps everything in a status envelope and will answer 2xx with
    // status:"error" for an unapproved sender name or exhausted balance, so the
    // envelope has to be checked separately from the HTTP status.
    if (!res.ok || payload.status === 'error' || payload.status === 'failed') {
      throw new Error(`sendchamp ${res.status}: ${payload.message || JSON.stringify(payload)}`)
    }

    return { id: messageId(payload) }
  }
}

// The id's position in the envelope varies by endpoint version, so probe the known
// shapes rather than assume one. A missing id is not fatal — it only means delivery
// reports for this message cannot be correlated later.
function messageId(payload) {
  const d = payload.data
  return d?.id || d?.reference || d?.message_id || (Array.isArray(d?.data) ? d.data[0]?.id : undefined)
}
