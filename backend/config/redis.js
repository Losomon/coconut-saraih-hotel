/**
 * Redis Configuration and Connection
 */

const redis = require('redis');
const config = require('./index');

let redisClient = null;
let isConnected = false;

/**
 * Create and configure Redis client
 */
const createRedisClient = () => {
  redisClient = redis.createClient({
    socket: {
      host: config.redis.options.host,
      port: config.redis.options.port,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Max reconnection attempts reached for Redis');
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      }
    },
    password: config.redis.options.password,
    database: config.redis.options.db
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
    isConnected = true;
  });

  redisClient.on('ready', () => {
    console.log('Redis Client Ready');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis Client Reconnecting...');
  });

  return redisClient;
};

/**
 * Initialize and connect Redis
 */
const connectRedis = async () => {
  try {
    if (!redisClient) {
      createRedisClient();
    }
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    // Don't exit - allow app to run without Redis
    return null;
  }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => redisClient;

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => isConnected;

/**
 * Redis utility functions
 */
const redisUtils = {
  /**
   * Set cache with TTL
   */
  async setCache(key, value, ttlSeconds = 300) {
    if (!redisClient || !isConnected) return null;
    try {
      const serialized = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      console.error('Redis setCache error:', error.message);
      return null;
    }
  },

  /**
   * Get cache
   */
  async getCache(key) {
    if (!redisClient || !isConnected) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis getCache error:', error.message);
      return null;
    }
  },

  /**
   * Delete cache key
   */
  async deleteCache(key) {
    if (!redisClient || !isConnected) return null;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis deleteCache error:', error.message);
      return null;
    }
  },

  /**
   * Delete cache keys by pattern
   */
  async deleteCacheByPattern(pattern) {
    if (!redisClient || !isConnected) return null;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Redis deleteCacheByPattern error:', error.message);
      return 0;
    }
  },

  /**
   * Store session data
   */
  async setSession(sessionId, sessionData, ttlSeconds = 86400) {
    return this.setCache(`session:${sessionId}`, sessionData, ttlSeconds);
  },

  /**
   * Get session data
   */
  async getSession(sessionId) {
    return this.getCache(`session:${sessionId}`);
  },

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    return this.deleteCache(`session:${sessionId}`);
  },

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId, token, ttlSeconds = 604800) { // 7 days
    return this.setCache(`refresh:${userId}`, token, ttlSeconds);
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(userId) {
    return this.getCache(`refresh:${userId}`);
  },

  /**
   * Invalidate refresh token
   */
  async invalidateRefreshToken(userId) {
    return this.deleteCache(`refresh:${userId}`);
  },

  /**
   * Increment rate limit counter
   */
  async incrementRateLimit(identifier, windowMs, maxRequests) {
    const key = `ratelimit:${identifier}`;
    const ttl = Math.ceil(windowMs / 1000);
    
    try {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, ttl);
      }
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (ttl * 1000)
      };
    } catch (error) {
      console.error('Redis incrementRateLimit error:', error.message);
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs };
    }
  },

  /**
   * Publish to channel
   */
  async publish(channel, message) {
    if (!redisClient || !isConnected) return false;
    try {
      await redisClient.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Redis publish error:', error.message);
      return false;
    }
  },

  /**
   * Subscribe to channel (returns promise)
   */
  async subscribe(channel, callback) {
    if (!redisClient || !isConnected) return false;
    try {
      const subscriber = redisClient.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, (message) => {
        callback(JSON.parse(message));
      });
      return true;
    } catch (error) {
      console.error('Redis subscribe error:', error.message);
      return false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  redisClient: redisUtils
};
