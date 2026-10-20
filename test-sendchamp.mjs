// One-off live check: sends a single real SMS through Sendchamp.
//   cd admin-portal && node --env-file=.env.prod ../test-sendchamp.mjs 08064960219
//   ...optionally overriding the sender name, to try candidates against the account:
//   node --env-file=.env.prod ../test-sendchamp.mjs 08064960219 Sendchamp
// Delete this file once the live path is confirmed.
//
// Uses node:https rather than fetch deliberately: Node 25's fetch (undici) cannot
// reach api.sendchamp.com on this machine, while the core client can. Vercel runs
// this project on Node 24, where the app's fetch-based provider works — so this
// script validates the parts that are actually in question (key, sender ID, route,
// and whether the message lands), not the transport.
import https from 'node:https'
import { resolveBrand, senderIdFor } from './admin-portal/lib/sms/brands.js'

const phone = process.argv[2]
if (!phone) throw new Error('usage: node ../test-sendchamp.mjs <phone>')

const to = '234' + phone.replace(/\D/g, '').replace(/^(0|234)/, '')
const brand = resolveBrand(process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'childmap.org')
// argv[3] overrides the brand's sender ID, for probing which name the account accepts
const senderId = (process.argv[3] || senderIdFor(brand)).slice(0, 11)
const route = process.env.SENDCHAMP_ROUTE || 'dnd'
const apiKey = process.env.SENDCHAMP_PUBLIC_KEY
if (!apiKey) throw new Error('SENDCHAMP_PUBLIC_KEY is not set')

// Same payload the app's provider builds — see lib/sms/providers/sendchamp.js
const payload = JSON.stringify({
  to: [to],
  message: `${brand.name}: Ada Obi arrived at school at 7:42 AM.`,
  sender_name: senderId,
  route,
})

console.log(`to=+${to}  sender_name=${senderId}  route=${route}`)

const req = https.request({
  host: 'api.sendchamp.com',
  path: '/api/v1/sms/send',
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
}, (res) => {
  let body = ''
  res.on('data', (c) => (body += c))
  res.on('end', () => {
    let parsed
    try { parsed = JSON.parse(body) } catch { parsed = null }

    // Sendchamp answers 2xx with status:"error" for an unapproved sender name or an
    // exhausted balance, so the envelope matters as much as the HTTP status.
    const ok = res.statusCode < 300 && parsed?.status !== 'error' && parsed?.status !== 'failed'
    if (ok) {
      console.log('ACCEPTED — HTTP', res.statusCode)
      console.log('  response:', body.slice(0, 300))
      console.log('\nNow check the handset. Accepted but never received = route/DND problem.')
    } else {
      console.error('REJECTED — HTTP', res.statusCode)
      console.error('  message :', parsed?.message ?? body.slice(0, 300))
    }
  })
})

req.on('error', (err) => console.error('TRANSPORT FAILED —', err.message, err.code ?? ''))
req.write(payload)
req.end()
