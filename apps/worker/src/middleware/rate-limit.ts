import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../index'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (per Worker isolate — resets on cold start)
const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries periodically
let lastCleanup = 0
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return // max 1x per menit
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

interface RateLimitOptions {
  /** Max requests per window */
  max: number
  /** Window duration in seconds */
  windowSec: number
  /** Custom key generator (default: IP + path) */
  keyGenerator?: (c: any) => string
}

/**
 * Rate limiter middleware.
 *
 * Default: 30 requests per 60 detik per IP+path.
 * Untuk auth endpoints: gunakan max=5 windowSec=60.
 */
export function rateLimit(options?: Partial<RateLimitOptions>) {
  const max = options?.max ?? 30
  const windowSec = options?.windowSec ?? 60

  return createMiddleware<AppEnv>(async (c, next) => {
    cleanup()

    const ip =
      c.req.header('CF-Connecting-IP') ||
      c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
      'unknown'
    const path = new URL(c.req.url).pathname
    const key = options?.keyGenerator?.(c) ?? `${ip}:${path}`

    const now = Date.now()
    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
      // New window
      store.set(key, { count: 1, resetAt: now + windowSec * 1000 })
      return next()
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      c.header('Retry-After', String(retryAfter))
      c.header('X-RateLimit-Limit', String(max))
      c.header('X-RateLimit-Remaining', '0')
      return c.json(
        {
          success: false,
          message: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
        },
        429
      )
    }

    entry.count++
    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(max - entry.count))

    return next()
  })
}
