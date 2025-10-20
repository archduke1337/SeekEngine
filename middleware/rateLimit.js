// middleware/rateLimit.js
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Create a rate limiter with custom configuration
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests per window
 * @param {string} message - Error message
 * @returns {Function} Express middleware
 */
export const createLimiter = (
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = 'Too many requests from this IP, please try again later.'
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    standardHeaders: true,  // Return rate limit info in headers
    legacyHeaders: false,   // Disable X-RateLimit headers
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
    keyGenerator: (req) => {
      // Handle X-Forwarded-For header for behind proxy (like Vercel)
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      // Use the ipKeyGenerator helper for proper IPv6 support
      return ipKeyGenerator(req);
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: req.rateLimit.resetTime
      });
    }
  });
};

// Pre-configured limiters for different endpoints

/**
 * Search endpoint limiter: 50 requests per 15 minutes per IP
 */
export const searchLimiter = createLimiter(
  15 * 60 * 1000,  // 15 minutes
  50,              // 50 requests per 15 minutes
  'Too many search requests. Please wait a moment.'
);

/**
 * General API limiter: 100 requests per minute per IP
 */
export const generalLimiter = createLimiter(
  60 * 1000,       // 1 minute
  100,             // 100 requests per minute
  'Too many requests. Please try again later.'
);

/**
 * Strict limiter for auth endpoints: 10 requests per 15 minutes per IP
 */
export const strictLimiter = createLimiter(
  15 * 60 * 1000,  // 15 minutes
  10,              // 10 requests per 15 minutes
  'Too many attempts. Please try again later.'
);
