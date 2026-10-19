// Africa's Talking. Strongest across East Africa (KE/UG/TZ/RW) — worth selecting per
// brand if either storefront expands beyond Nigeria. Uses the stable v1 form-encoded
// messaging endpoint; sandbox credentials hit a separate host.
const LIVE_URL = 'https://api.africastalking.com/version1/messaging'
const SANDBOX_URL = 'https://api.sandbox.africastalking.com/version1/messaging'

export default {
  name: 'africastalking',

  config: (read) => ({
    apiKey: read('AT_API_KEY'),
    username: read('AT_USERNAME')
  }),

  async send({ to, text, senderId, apiKey, username }) {
    if (!apiKey) throw new Error('AT_API_KEY not set')
    if (!username) throw new Error('AT_USERNAME not set')

    const form = new URLSearchParams({ username, to, message: text })
    // An unregistered sender ID is rejected outright rather than downgraded, so only
    // send `from` once the alphanumeric ID is approved on the account.
    if (senderId) form.set('from', senderId)

    const res = await fetch(username === 'sandbox' ? SANDBOX_URL : LIVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        apiKey
      },
      body: form
    })

    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(`africastalking ${res.status}: ${JSON.stringify(payload)}`)
    }

    // Per-recipient status lives in the recipients array; a 200 with zero accepted
    // recipients is a failure (invalid number, blacklisted, no credit).
    const recipient = payload.SMSMessageData?.Recipients?.[0]
    if (!recipient) {
      throw new Error(`africastalking rejected: ${payload.SMSMessageData?.Message || 'no recipients accepted'}`)
    }
    if (recipient.statusCode >= 200 && recipient.statusCode < 300) {
      return { id: recipient.messageId }
    }

    throw new Error(`africastalking ${recipient.status} (${recipient.statusCode})`)
  }
}
