import { resolveBrand, senderIdFor } from '../brands'
import { smsProviderFor } from './providers'

export { resolveBrand } from '../brands'

/**
 * Sends one SMS through the brand's configured provider. Throws on failure so callers
 * decide whether a failed notification is fatal — the cron alerts log and continue,
 * while the OTP flow needs to know.
 */
export async function sendSms({ to, text, brand }) {
  const provider = smsProviderFor(brand)
  const { id } = await provider.send({ to, text, senderId: senderIdFor(brand), brand })
  return { provider: provider.name, messageId: id ?? null }
}
