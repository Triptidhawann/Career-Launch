/**
 * Lightweight In-Memory Rate Limiter Middleware
 * Protects retrieval search endpoints against brute-force flooding and DoS.
 *
 * @param {object} options
 * @param {number} [options.windowMs=60000] - 1-minute time window
 * @param {number} [options.maxRequests=60] - Max requests permitted per window per client/IP
 * @returns {import('express').RequestHandler}
 */
export function rateLimiter({ windowMs = 60000, maxRequests = 60 } = {}) {
  const requestCounts = new Map()

  // Periodic cleanup of expired entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(key)
      }
    }
  }, 120000)

  // Prevent memory leaks / process hang on exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref()
  }

  return (req, res, next) => {
    const clientKey = req.user?.uid || req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    let record = requestCounts.get(clientKey)
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs }
      requestCounts.set(clientKey, record)
      return next()
    }

    record.count++
    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000)
      res.setHeader('Retry-After', retryAfterSec)
      return res.status(429).json({
        error: 'Too many search requests. Please slow down.',
        retryAfter: `${retryAfterSec}s`,
      })
    }

    next()
  }
}
