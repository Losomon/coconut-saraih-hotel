const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');

/**
 * Cache Middleware
 * 
 * Response caching middleware
 */

// Default cache options
const DEFAULT_CACHE_TTL = 300; // 5 minutes

/**
 * Generate cache key from request
 */
const generateCacheKey = (req) => {
  const base = `${req.method}:${req.originalUrl}`;
  const language = req.language || 'default';
  const userId = req.user?._id || 'anonymous';
  
  return `${base}:lang=${language}:user=${userId}`;
};

/**
 * Check if request is cacheable
 */
const isCacheable = (req) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return false;
  }
  
  // Don't cache requests with query parameters (unless explicitly enabled)
  if (Object.keys(req.query).length > 0 && !req.app.locals.cacheQueryParams) {
    return false;
  }
  
  // Don't cache authenticated requests (unless explicitly enabled)
  if (req.user && !req.app.locals.cacheAuthenticated) {
    return false;
  }
  
  return true;
};

/**
 * Cache middleware factory
 */
const cache = (options = {}) => {
  const {
    ttl = DEFAULT_CACHE_TTL,
    keyGenerator = generateCacheKey,
    cacheQueryParams = false,
    cacheAuthenticated = false
  } = options;
  
  return async (req, res, next) => {
    // Store cache settings in app locals for isCacheable check
    req.app.locals.cacheQueryParams = cacheQueryParams;
    req.app.locals.cacheAuthenticated = cacheAuthenticated;
    
    if (!isCacheable(req)) {
      return next();
    }
    
    const cacheKey = keyGenerator(req);
    
    try {
      // Try to get cached response
      const cachedResponse = await cacheService.get(cacheKey);
      
      if (cachedResponse) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        
        // Add cache header
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', ttl);
        
        // Check if ETag matches
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch && ifNoneMatch === cachedResponse.etag) {
          return res.status(304).end();
        }
        
        // Set ETag
        res.setHeader('ETag', cachedResponse.etag);
        
        // Set cache control headers
        res.setHeader('Cache-Control', `public, max-age=${ttl}`);
        
        return res.status(200).json(cachedResponse.data);
      }
      
      logger.debug(`Cache MISS: ${cacheKey}`);
      
      // Cache the response
      res.originalJson = res.json.bind(res);
      res.json = async (data) => {
        const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 16)}"`;
        
        const cachedData = {
          data,
          etag,
          timestamp: Date.now()
        };
        
        // Store in cache
        await cacheService.set(cacheKey, cachedData, ttl);
        
        // Set headers
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', `public, max-age=${ttl}`);
        
        return res.originalJson(data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Route-specific cache
 */
const cacheRoute = (route, ttl = DEFAULT_CACHE_TTL) => {
  return cache({ ttl, keyGenerator: () => route });
};

/**
 * Invalidate cache middleware
 */
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;
    let hasModified = false;
    
    res.end = function(...args) {
      // Only invalidate on successful operations
      if (!hasModified && (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204)) {
        hasModified = true;
        
        const patterns = typeof pattern === 'function' ? pattern(req) : pattern;
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        
        patternArray.forEach(async (p) => {
          await cacheService.delByPattern(p);
          logger.debug(`Cache invalidated: ${p}`);
        });
      }
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

/**
 * Invalidate by tags
 */
const invalidateByTags = (tags) => {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;
    
    res.end = function(...args) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.invalidateTags(tags);
        logger.debug(`Cache invalidated by tags: ${tags.join(', ')}`);
      }
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

/**
 * No cache middleware
 */
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
};

/**
 * ETag middleware
 */
const etag = (req, res, next) => {
  // Only for GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Store original send/json
  const originalJson = res.json;
  const originalSend = res.send;
  
  res.json = function(data) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const etag = `"${Buffer.from(body).toString('base64').substring(0, 16)}"`;
    
    res.setHeader('ETag', etag);
    
    // Check if-none-match
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      return res.status(304).end();
    }
    
    return originalJson.apply(this, arguments);
  };
  
  next();
};

/**
 * Last-Modified middleware
 */
const lastModified = (lastModifiedFn) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const lastModified = lastModifiedFn(req);
    
    if (lastModified) {
      res.setHeader('Last-Modified', new Date(lastModified).toUTCString());
      
      // Check if-modified-since
      const ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince && new Date(lastModified) <= new Date(ifModifiedSince)) {
        return res.status(304).end();
      }
    }
    
    next();
  };
};

/**
 * Conditional GET middleware
 */
const conditionalGet = (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }
  
  // Already handled by etag and lastModified
  next();
};

/**
 * Vary header middleware
 */
const vary = (...fields) => {
  return (req, res, next) => {
    const currentVary = res.get('Vary') || '';
    const newVary = [...new Set([...currentVary.split(',').map(f => f.trim()), ...fields])].join(', ');
    
    res.setHeader('Vary', newVary);
    next();
  };
};

/**
 * Public cache middleware
 */
const publicCache = (ttl = 3600) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl * 2}`);
    }
    next();
  };
};

/**
 * Private cache middleware
 */
const privateCache = (ttl = 600) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      if (req.user) {
        res.setHeader('Cache-Control', `private, max-age=${ttl}`);
      } else {
        res.setHeader('Cache-Control', `public, max-age=${ttl}`);
      }
    }
    next();
  };
};

/**
 * CDN-friendly cache middleware
 */
const staticCache = (ttl = 86400) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${ttl}, immutable`);
    }
    next();
  };
};

module.exports = {
  cache,
  cacheRoute,
  invalidateCache,
  invalidateByTags,
  noCache,
  etag,
  lastModified,
  conditionalGet,
  vary,
  publicCache,
  privateCache,
  staticCache,
  generateCacheKey,
  isCacheable,
  DEFAULT_CACHE_TTL
};
