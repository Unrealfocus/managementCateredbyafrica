const rateLimit = require('express-rate-limit');
const { redis } = require('../config/redis');

/**
 * Create rate limiter with Redis store
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      },
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    // Use Redis for distributed rate limiting
    store: {
      async increment(key) {
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, Math.ceil(windowMs / 1000));
        }
        return {
          totalHits: count,
          resetTime: new Date(Date.now() + windowMs)
        };
      },
      async decrement(key) {
        await redis.decr(key);
      },
      async resetKey(key) {
        await redis.del(key);
      }
    }
  });
};

// Specific rate limiters
const authLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
  skipSuccessfulRequests: true
});

const strictLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests for this action, please try again later'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter
};
