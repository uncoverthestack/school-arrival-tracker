import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRatelimit(requests, window) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  })
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) })
}

// 5 registration attempts per IP per minute — prevents code brute-force
export const registerLimiter = makeRatelimit(5, '1 m')

// 60 scans per school per minute — prevents scan flooding
export const scanLimiter = makeRatelimit(60, '1 m')

// 10 login attempts per IP per 15 minutes
export const loginLimiter = makeRatelimit(10, '15 m')

export async function checkLimit(limiter, key, request) {
  if (!limiter) return { allowed: true }
  const identifier = key ?? request?.headers?.get('x-forwarded-for') ?? 'unknown'
  const { success } = await limiter.limit(identifier)
  return { allowed: success }
}
