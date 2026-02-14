const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Rate Limiting Middleware
 * 
 * Different rate limits for different user tiers
 */

// Default rate limiter
const defaultLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });
    next(ApiError.tooManyRequests('Too many requests, please try again later.'));
  }
});

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      email: req.body.email
    });
    next(ApiError.tooManyRequests('Too many authentication attempts, please try again later.'));
  }
});

// Payment rate limiter (stricter for security)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 payment attempts per hour
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn('Payment rate limit exceeded:', {
      ip: req.ip,
      userId: req.user?._id
    });
    next(ApiError.tooManyRequests('Too many payment attempts, please try again later.'));
  }
});

// API upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many upload attempts, please try again later.'));
  }
});

// Booking rate limiter
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  message: {
    success: false,
    message: 'Too many booking attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn('Booking rate limit exceeded:', {
      ip: req.ip,
      userId: req.user?._id
    });
    next(ApiError.tooManyRequests('Too many booking attempts, please try again later.'));
  }
});

// Premium/Authenticated user rate limiter
const premiumLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute for premium users
  message: {
    success: false,
    message: 'Rate limit exceeded for your account.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Custom rate limiter factory
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: options.handler || undefined,
    keyGenerator: options.keyGenerator || undefined,
    skip: options.skip || undefined,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    validate: options.validate !== false
  });
};

// Redis-based rate limiter (for distributed systems)
// This would require additional setup with Redis
const createRedisRateLimiter = (options) => {
  const { RateLimiterRedis } = require('rate-limiter-flexible');
  const Redis = require('ioredis');
  
  const redisClient = new Redis(process.env.REDIS_URL);
  
  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: options.keyPrefix || 'middleware',
    points: options.max || 100,
    duration: (options.windowMs || 60000) / 1000,
    blockDuration: 0
  });
  
  return (req, res, next) => {
    rateLimiter.consume(req.ip)
      .then(() => next())
      .catch(() => {
        next(ApiError.tooManyRequests('Too many requests, please try again later.'));
      });
  };
};

module.exports = {
  defaultLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
  bookingLimiter,
  premiumLimiter,
  createRateLimiter,
  createRedisRateLimiter
};
