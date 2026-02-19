/**
 * Edge-compatible in-memory rate limiter
 * Uses a sliding window counter per IP address
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL = 60_000 // 1 min
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number
  /** Window size in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if a request is allowed under the rate limit
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  // No existing entry or window expired — allow and start new window
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt }
  }

  // Within window
  if (entry.count < config.maxRequests) {
    entry.count++
    return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
  }

  // Rate limited
  return { allowed: false, remaining: 0, resetAt: entry.resetAt }
}

/**
 * Extract client IP from request headers (edge-compatible)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  
  return 'unknown'
}

// Pre-configured rate limit configs per route type
export const RATE_LIMITS = {
  search: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,    // 30/min
  stream: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,    // 20/min
  suggest: { maxRequests: 60, windowMs: 60_000 } as RateLimitConfig,   // 60/min (typed fast)
  answer: { maxRequests: 20, windowMs: 60_000 } as RateLimitConfig,    // 20/min
} as const

/**
 * Create a 429 Too Many Requests response with standard headers
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    }
  )
}
