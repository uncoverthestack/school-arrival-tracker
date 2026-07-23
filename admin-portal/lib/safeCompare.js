import { timingSafeEqual } from 'crypto'

// Constant-time string comparison — prevents leaking how many leading
// characters matched via response timing (used for secrets: passwords, OTPs).
export function safeCompare(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) {
    // Still run a comparison to avoid leaking length via timing
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}
