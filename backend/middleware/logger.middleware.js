const logger = require('../utils/logger');

/**
 * Logger Middleware
 * 
 * Request/Response logging
 */

// Request log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Request logger - logs incoming requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  logger.info('Incoming Request:', {
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    contentType: req.get('content-type'),
    contentLength: req.get('content-length'),
    referer: req.get('referer'),
    authorization: req.headers.authorization ? '[HIDDEN]' : undefined,
    userId: req.user?._id
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    
    const duration = Date.now() - start;
    
    // Log response details
    logger.info('Response Sent:', {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });
    
    return res.send(data);
  };
  
  next();
};

/**
 * Error logger - logs errors
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Request Error:', {
    method: req.method,
    url: req.originalUrl || req.url,
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      code: err.code,
      statusCode: err.statusCode
    },
    body: process.env.NODE_ENV === 'development' ? req.body : undefined,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?._id
  });
  
  next(err);
};

/**
 * API request logger - detailed API logging
 */
const apiLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Add request ID to request
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  logger.debug('API Request:', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? '[HIDDEN]' : undefined,
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for']
    },
    ip: req.ip,
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    };
    
    if (req.user) {
      logData.userId = req.user._id;
    }
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('API Response (Server Error):', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('API Response (Client Error):', logData);
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug('API Response:', logData);
    }
  });
  
  next();
};

/**
 * Security logger - logs security events
 */
const securityLogger = (event, details) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Auth event logger
 */
const authLogger = (event, details) => {
  logger.info(`Auth Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Business event logger - logs important business events
 */
const businessLogger = (event, details) => {
  logger.info(`Business Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Performance logger - logs slow requests
 */
const performanceLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (duration > threshold) {
        logger.warn('Slow Request Detected:', {
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          userId: req.user?._id,
          ip: req.ip
        });
      }
    });
    
    next();
  };
};

/**
 * Request body logger (for debugging)
 */
const bodyLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Request Body:', req.body);
  }
  next();
};

/**
 * Query logger (for debugging)
 */
const queryLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Request Query:', req.query);
  }
  next();
};

/**
 * Headers logger (for debugging)
 */
const headersLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Request Headers:', {
      host: req.headers.host,
      connection: req.headers.connection,
      authorization: req.headers.authorization ? '[HIDDEN]' : undefined,
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'user-agent': req.headers['user-agent'],
      'accept': req.headers.accept,
      'accept-language': req.headers['accept-language'],
      'accept-encoding': req.headers['accept-encoding']
    });
  }
  next();
};

/**
 * HTTP method logger
 */
const methodLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
};

/**
 * Access log format (Apache/Nginx style)
 */
const accessLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = [
      req.ip || '-',
      '-',
      `- [${new Date().toISOString()}]`,
      `"${req.method} ${req.originalUrl} HTTP/${req.httpVersion}"`,
      res.statusCode,
      res.get('content-length') || '-',
      `"${req.get('referer') || '-'}"`,
      `"${req.get('user-agent') || '-'}"`,
      `${duration}ms`
    ].join(' ');
    
    logger.access(logEntry);
  });
  
  next();
};

/**
 * Morgan-style token generation
 */
const morganTokens = {
  ':method': req => req.method,
  ':url': req => req.originalUrl,
  ':status': res => res.statusCode,
  ':response-time': res => {
    if (res.responseTime) return `${res.responseTime}ms`;
    return '-';
  },
  ':remote-addr': req => req.ip,
  ':http-version': req => `HTTP/${req.httpVersion}`,
  ':user-agent': req => req.get('user-agent'),
  ':referrer': req => req.get('referer')
};

module.exports = {
  requestLogger,
  errorLogger,
  apiLogger,
  securityLogger,
  authLogger,
  businessLogger,
  performanceLogger,
  bodyLogger,
  queryLogger,
  headersLogger,
  methodLogger,
  accessLogger,
  morganTokens,
  LOG_LEVELS
};
