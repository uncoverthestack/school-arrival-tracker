import { brandEnv } from '../../brands'
import sendchamp from './sendchamp'
import termii from './termii'
import africastalking from './africastalking'

// HTTP-only providers, so they run anywhere — no AWS SDK, no separate deploy target.
// AWS SNS is deliberately absent: it needs @aws-sdk/client-sns, has no Nigerian
// sender-ID registration path, and reports DND-blocked messages as successful.
const PROVIDERS = { sendchamp, termii, africastalking }

export function smsProviderFor(brand) {
  const name = (brandEnv(brand, 'SMS_PROVIDER', 'sendchamp') || 'sendchamp').toLowerCase()
  const provider = PROVIDERS[name]
  if (!provider) {
    throw new Error(`Unknown SMS_PROVIDER "${name}" — expected one of ${Object.keys(PROVIDERS).join(', ')}`)
  }

  const read = (key, fallback) => brandEnv(brand, key, fallback)
  const credentials = provider.config ? provider.config(read) : {}

  return {
    name: provider.name,
    send: (message) => provider.send({ ...message, ...credentials }),
  }
}

export const providerNames = Object.keys(PROVIDERS)
