import { describe, it, expect } from 'vitest'
import { checkRateLimit, type RateLimitConfig } from '../src/lib/rate-limit'

const config: RateLimitConfig = { maxRequests: 3, windowMs: 60_000 }

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const key = `test-allow-${Date.now()}`
    expect(checkRateLimit(key, config).allowed).toBe(true)
    expect(checkRateLimit(key, config).allowed).toBe(true)
    expect(checkRateLimit(key, config).allowed).toBe(true)
  })

  it('blocks requests over the limit', () => {
    const key = `test-block-${Date.now()}`
    checkRateLimit(key, config)
    checkRateLimit(key, config)
    checkRateLimit(key, config)
    const result = checkRateLimit(key, config)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('returns correct remaining count', () => {
    const key = `test-remaining-${Date.now()}`
    const r1 = checkRateLimit(key, config)
    expect(r1.remaining).toBe(2)
    const r2 = checkRateLimit(key, config)
    expect(r2.remaining).toBe(1)
  })
})
