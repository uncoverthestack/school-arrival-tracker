import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRatelimit(name, refillRate, interval, maxTokens) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  // Skip if not configured or if placeholder values are still set
  if (!url || !token || url.includes('your-upstash') || token.includes('your-upstash')) {
    return null
  }
  const redis = new Redis({ url, token })
  // tokenBucket with maxTokens === refillRate = no burst accumulation (leaky bucket behaviour)
  // Distinct prefix per limiter — without it, every limiter shares Upstash's default
  // "@upstash/ratelimit" key prefix and different endpoints hitting the same identifier
  // (e.g. the same IP, or the shared 'unknown' fallback) corrupt each other's counters.
  return new Ratelimit({ redis, limiter: Ratelimit.tokenBucket(refillRate, interval, maxTokens), prefix: `ratelimit:${name}` })
}

// refillRate, interval, maxTokens
// maxTokens kept equal to refillRate so tokens never accumulate — requests must arrive at a steady rate
export const registerLimiter  = makeRatelimit('register', 5, '1 m', 5)     // 5 per minute, no burst
export const scanLimiter      = makeRatelimit('scan', 60, '1 m', 60)   // 60 per minute, no burst
export const loginLimiter     = makeRatelimit('login', 10, '15 m', 10)  // 10 per 15 min, no burst
export const demoRequestLimiter = makeRatelimit('demo-request', 3, '15 m', 3)  // 3 per 15 min, no burst
export const forgotPasswordLimiter = makeRatelimit('forgot-password', 3, '15 m', 3) // 3 per 15 min, no burst

export async function checkLimit(limiter, key, request) {
  if (!limiter) return { allowed: true }
  const identifier = key ?? request?.headers?.get('x-forwarded-for') ?? 'unknown'
  try {
    const { success } = await limiter.limit(identifier)
    return { allowed: success }
  } catch {
    // If Redis is unreachable, allow the request rather than blocking everything
    return { allowed: true }
  }
}
