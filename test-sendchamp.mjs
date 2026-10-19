// One-off live check: sends a single real SMS through the same provider file the app
// uses, so an accepted send proves the key, sender ID and route are all correct.
//   cd admin-portal && node --env-file=.env.local ../test-sendchamp.mjs 08064960219
// Delete this file once the live path is confirmed.
import { resolveBrand, senderIdFor } from './admin-portal/lib/sms/brands.js'
import sendchamp from './admin-portal/lib/sms/providers/sendchamp.js'

const phone = process.argv[2]
if (!phone) throw new Error('usage: node ../test-sendchamp.mjs <phone>')

const to = '+234' + phone.replace(/\D/g, '').replace(/^(0|234)/, '')
const brand = resolveBrand(process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'childmap.org')
const creds = sendchamp.config((k, d) => process.env[k] ?? d)

console.log(`to=${to}  sender_name=${senderIdFor(brand)}  route=${creds.route}`)

try {
  const { id } = await sendchamp.send({
    to, text: `${brand.name}: Ada Obi arrived at school at 7:42 AM.`,
    senderId: senderIdFor(brand), ...creds,
  })
  console.log('ACCEPTED — message id:', id)
  console.log('Now check the handset. Accepted but never received = route/DND problem.')
} catch (err) {
  console.error('REJECTED —', err.message)
}
