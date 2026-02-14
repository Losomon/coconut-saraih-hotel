/**
 * Winston Logger Configuration
 */

const winston = require('winston');
const path = require('path');
const config = require('../config');

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  return log;
});

// JSON format for production
const jsonFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

// Console format for development
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  customFormat
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: process.env.NODE_ENV === 'production' ? jsonFormat : consoleFormat,
  defaultMeta: { 
    service: 'coconut-saraih-api',
    environment: config.server.nodeEnv 
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    })
  ],
  exitOnError: false
});

// Add file transports in production
if (config.server.nodeEnv === 'production') {
  const fs = require('fs');
  const logDir = config.logging.logDir;
  
  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Error log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 20971520, // 20MB
    maxFiles: config.logging.maxFiles,
    zippedArchive: true
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 20971520,
    maxFiles: config.logging.maxFiles,
    zippedArchive: true
  }));

  // API request log
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'api.log'),
    level: 'info',
    maxsize: 20971520,
    maxFiles: config.logging.maxFiles,
    zippedArchive: true
  }));
}

/**
 * Log API request
 */
const logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.id || 'anonymous'
  };

  if (res.statusCode >= 400) {
    logger.warn('API Request Failed', logData);
  } else {
    logger.info('API Request', logData);
  }
};

/**
 * Log database query (for debugging)
 */
const logQuery = (query, duration) => {
  logger.debug('Database Query', { query, duration: `${duration}ms` });
};

/**
 * Log user action for audit
 */
const logUserAction = (userId, action, details = {}) => {
  logger.info('User Action', { userId, action, ...details });
};

/**
 * Log security event
 */
const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', { event, ...details });
};

/**
 * Log payment transaction
 */
const logPayment = (transactionId, amount, status, details = {}) => {
  logger.info('Payment Transaction', { transactionId, amount, status, ...details });
};

module.exports = {
  logger,
  logRequest,
  logQuery,
  logUserAction,
  logSecurityEvent,
  logPayment
};
