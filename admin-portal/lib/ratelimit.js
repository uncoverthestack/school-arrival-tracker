import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRatelimit(refillRate, interval, maxTokens) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  // Skip if not configured or if placeholder values are still set
  if (!url || !token || url.includes('your-upstash') || token.includes('your-upstash')) {
    return null
  }
  const redis = new Redis({ url, token })
  // tokenBucket with maxTokens === refillRate = no burst accumulation (leaky bucket behaviour)
  return new Ratelimit({ redis, limiter: Ratelimit.tokenBucket(refillRate, interval, maxTokens) })
}

// refillRate, interval, maxTokens
// maxTokens kept equal to refillRate so tokens never accumulate — requests must arrive at a steady rate
export const registerLimiter  = makeRatelimit(5, '1 m', 5)     // 5 per minute, no burst
export const scanLimiter      = makeRatelimit(60, '1 m', 60)   // 60 per minute, no burst
export const loginLimiter     = makeRatelimit(10, '15 m', 10)  // 10 per 15 min, no burst
export const demoRequestLimiter = makeRatelimit(3, '15 m', 3)  // 3 per 15 min, no burst

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
