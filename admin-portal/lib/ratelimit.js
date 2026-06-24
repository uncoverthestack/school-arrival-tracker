import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRatelimit(requests, window) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  // Skip if not configured or if placeholder values are still set
  if (!url || !token || url.includes('your-upstash') || token.includes('your-upstash')) {
    return null
  }
  const redis = new Redis({ url, token })
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) })
}

export const registerLimiter = makeRatelimit(5, '1 m')
export const scanLimiter = makeRatelimit(60, '1 m')
export const loginLimiter = makeRatelimit(10, '15 m')

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
