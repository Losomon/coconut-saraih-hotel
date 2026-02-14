const logger = require('../utils/logger');

/**
 * Cache Service - Redis caching
 */
class CacheService {
  constructor() {
    this.isEnabled = !!process.env.REDIS_URL;
    this.redis = null;
    
    if (this.isEnabled) {
      this.initRedis();
    }
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    try {
      const Redis = require('ioredis');
      this.redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100
      });
      
      this.redis.on('connect', () => {
        logger.info('Redis connected for caching');
      });
      
      this.redis.on('error', (err) => {
        logger.error('Redis error:', err.message);
      });
    } catch (error) {
      logger.error('Redis init error:', error.message);
      this.isEnabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttlSeconds = 300) {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error.message);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key) {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error.message);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delByPattern(pattern) {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete by pattern error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cache helper with automatic key generation
   */
  async remember(key, fn, ttlSeconds = 300) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function to get data
    const data = await fn();
    
    // Store in cache
    await this.set(key, data, ttlSeconds);
    
    return data;
  }

  /**
   * Invalidate cache tags
   */
  async invalidateTags(tags) {
    for (const tag of tags) {
      await this.delByPattern(`*:${tag}:*`);
    }
  }

  // Predefined cache methods for common data

  /**
   * Cache rooms list
   */
  async cacheRooms(rooms) {
    return this.set('rooms:all', rooms, 900); // 15 minutes
  }

  /**
   * Get cached rooms
   */
  async getCachedRooms() {
    return this.get('rooms:all');
  }

  /**
   * Invalidate rooms cache
   */
  async invalidateRoomsCache() {
    return this.del('rooms:all');
  }

  /**
   * Cache menu items
   */
  async cacheMenu(menu) {
    return this.set('restaurant:menu', menu, 3600); // 1 hour
  }

  /**
   * Get cached menu
   */
  async getCachedMenu() {
    return this.get('restaurant:menu');
  }

  /**
   * Invalidate menu cache
   */
  async invalidateMenuCache() {
    return this.del('restaurant:menu');
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(key, data) {
    return this.set(`analytics:${key}`, data, 300); // 5 minutes
  }

  /**
   * Get cached analytics
   */
  async getCachedAnalytics(key) {
    return this.get(`analytics:${key}`);
  }
}

module.exports = new CacheService();
