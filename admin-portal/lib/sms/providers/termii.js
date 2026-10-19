// Termii — Nigeria-native aggregator. The `channel` setting is the part that matters
// for +234: 'dnd' routes over the carrier corporate lanes that reach Do-Not-Disturb
// registered numbers, which is most Nigerian mobile subscribers. 'generic' is cheaper
// but silently undelivered for anyone on DND.
const BASE_URL = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com'

export default {
  name: 'termii',

  config: (read) => ({
    apiKey: read('TERMII_API_KEY'),
    channel: read('TERMII_CHANNEL', 'dnd')
  }),

  async send({ to, text, senderId, apiKey, channel }) {
    if (!apiKey) throw new Error('TERMII_API_KEY not set')

    const res = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        to,
        from: senderId,
        sms: text,
        type: 'plain',
        channel
      })
    })

    const payload = await res.json().catch(() => ({}))

    // Termii answers 200 with a body-level error for rejected sender IDs and
    // insufficient balance, so status alone is not enough to call this a success.
    if (!res.ok || payload.code === 'error' || (payload.message && !payload.message_id)) {
      throw new Error(`termii ${res.status}: ${payload.message || JSON.stringify(payload)}`)
    }

    return { id: payload.message_id }
  }
}
