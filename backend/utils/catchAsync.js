/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to next()
 */

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Async Handler with explicit error handling
 */
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Wrapper for try-catch with custom error handling
 */
const tryCatch = async (tryFn, catchFn) => {
  try {
    return await tryFn();
  } catch (error) {
    if (catchFn) {
      return catchFn(error);
    }
    throw error;
  }
};

/**
 * Promise wrapper that always resolves
 * Useful for operations that might fail but shouldn't break the flow
 */
const promiseWrapper = (promise) => {
  return promise
    .then(data => [null, data])
    .catch(error => [error, null]);
};

/**
 * Run promises in parallel with error handling
 */
const promiseAll = (promises) => {
  return Promise.allSettled(promises).then(results => {
    const successful = [];
    const failed = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push({ index, data: result.value });
      } else {
        failed.push({ index, error: result.reason });
      }
    });
    
    return { successful, failed };
  });
};

/**
 * Retry utility for unreliable operations
 */
const retry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        
        if (onRetry) {
          onRetry({ attempt, maxRetries, error, waitTime });
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

/**
 * Timeout wrapper
 */
const withTimeout = (promise, timeoutMs, timeoutError = new Error('Operation timed out')) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(timeoutError), timeoutMs)
    )
  ]);
};

module.exports = {
  catchAsync,
  asyncHandler,
  tryCatch,
  promiseWrapper,
  promiseAll,
  retry,
  withTimeout
};
