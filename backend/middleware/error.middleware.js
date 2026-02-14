const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Error Handling Middleware
 * 
 * Centralized error handling for the application
 */

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message
  }));
  
  return new ApiError(400, 'Validation Error', true, errors);
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  return new ApiError(
    409,
    `A record with this ${field} already exists`,
    true
  );
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  return new ApiError(400, 'Invalid ID format', true);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please log in again.', true);
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new ApiError(401, 'Your token has expired. Please log in again.', true);
};

/**
 * Global error handler
 */
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  } else {
    logger.error('Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode: error.statusCode
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    status: error.status || 'error',
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal Server Error',
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
};

/**
 * Not found handler (404)
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Cannot find ${req.originalUrl} on this server`);
  next(error);
};

/**
 * Async error wrapper
 * Use this instead of try-catch in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Unhandled promise rejection handler
 */
const handleUnhandledRejection = (err) => {
  logger.error('Unhandled Promise Rejection:', {
    message: err.message,
    stack: err.stack
  });
  
  // Gracefully shutdown
  process.exit(1);
};

/**
 * Uncaught exception handler
 */
const handleUncaughtException = (err) => {
  logger.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack
  });
  
  // Gracefully shutdown
  process.exit(1);
};

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  handleUnhandledRejection,
  handleUncaughtException
};
