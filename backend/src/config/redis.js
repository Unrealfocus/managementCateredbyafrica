const Redis = require('ioredis');

// Redis configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Helper functions
const cacheHelper = {
  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Parsed data or null
   */
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 300) {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  /**
   * Delete from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    await redis.del(key);
  },

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   */
  async delPattern(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

module.exports = { redis, cacheHelper };
