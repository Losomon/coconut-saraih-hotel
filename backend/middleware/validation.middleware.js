const ApiError = require('../utils/ApiError');

/**
 * Validation Middleware
 * 
 * Request body, query, and parameter validation
 */

// Validation rules storage (can be extended with a validation library like Joi)
const validationRules = new Map();

/**
 * Register validation rules for a route
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    // Validate body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body);
      if (bodyErrors.length > 0) {
        errors.push(...bodyErrors);
      }
    }
    
    // Validate query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query);
      if (queryErrors.length > 0) {
        errors.push(...queryErrors);
      }
    }
    
    // Validate params
    if (schema.params) {
      const paramErrors = validateObject(req.params, schema.params);
      if (paramErrors.length > 0) {
        errors.push(...paramErrors);
      }
    }
    
    // Validate files
    if (schema.files) {
      const fileErrors = validateFiles(req.files, schema.files);
      if (fileErrors.length > 0) {
        errors.push(...fileErrors);
      }
    }
    
    if (errors.length > 0) {
      return next(new ApiError(400, 'Validation failed', true, errors));
    }
    
    next();
  };
};

/**
 * Validate an object against a schema
 */
const validateObject = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`
      });
      continue;
    }
    
    // Skip further validation if value is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type) {
      const typeValid = validateType(value, rules.type);
      if (!typeValid) {
        errors.push({
          field,
          message: `${field} must be of type ${rules.type}`
        });
        continue;
      }
    }
    
    // String validations
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.minLength} characters`
        });
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field,
          message: `${field} must not exceed ${rules.maxLength} characters`
        });
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          field,
          message: rules.patternMessage || `${field} has invalid format`
        });
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rules.enum.join(', ')}`
        });
      }
    }
    
    // Number validations
    if (rules.type === 'number') {
      const numValue = Number(value);
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.min}`
        });
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push({
          field,
          message: `${field} must not exceed ${rules.max}`
        });
      }
    }
    
    // Array validations
    if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push({
          field,
          message: `${field} must be an array`
        });
      } else {
        if (rules.minItems && value.length < rules.minItems) {
          errors.push({
            field,
            message: `${field} must have at least ${rules.minItems} items`
          });
        }
        if (rules.maxItems && value.length > rules.maxItems) {
          errors.push({
            field,
            message: `${field} must not exceed ${rules.maxItems} items`
          });
        }
        if (rules.items) {
          value.forEach((item, index) => {
            const itemErrors = validateObject({ item }, { item: rules.items });
            if (itemErrors.length > 0) {
              errors.push(...itemErrors.map(e => ({
                ...e,
                field: `${field}[${index}].${e.field.replace('item.', '')}`
              })));
            }
          });
        }
      }
    }
    
    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field,
          message: `${field} must be a valid email address`
        });
      }
    }
    
    // URL validation
    if (rules.url) {
      try {
        new URL(value);
      } catch {
        errors.push({
          field,
          message: `${field} must be a valid URL`
        });
      }
    }
    
    // Date validation
    if (rules.date) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push({
          field,
          message: `${field} must be a valid date`
        });
      } else {
        if (rules.minDate && date < new Date(rules.minDate)) {
          errors.push({
            field,
            message: `${field} must be after ${rules.minDate}`
          });
        }
        if (rules.maxDate && date > new Date(rules.maxDate)) {
          errors.push({
            field,
            message: `${field} must be before ${rules.maxDate}`
          });
        }
      }
    }
    
    // Custom validator
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) {
        errors.push({
          field,
          message: customError
        });
      }
    }
  }
  
  return errors;
};

/**
 * Validate value type
 */
const validateType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value));
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && !Array.isArray(value);
    case 'date':
      return !isNaN(Date.parse(value));
    default:
      return true;
  }
};

/**
 * Validate uploaded files
 */
const validateFiles = (files, rules) => {
  const errors = [];
  
  if (!files || (Array.isArray(files) && files.length === 0)) {
    if (rules.required) {
      errors.push({
        field: 'files',
        message: 'File upload is required'
      });
    }
    return errors;
  }
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  if (rules.minFiles && fileArray.length < rules.minFiles) {
    errors.push({
      field: 'files',
      message: `At least ${rules.minFiles} file(s) required`
    });
  }
  
  if (rules.maxFiles && fileArray.length > rules.maxFiles) {
    errors.push({
      field: 'files',
      message: `Maximum ${rules.maxFiles} file(s) allowed`
    });
  }
  
  if (rules.allowedTypes) {
    fileArray.forEach((file, index) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (!rules.allowedTypes.includes(ext)) {
        errors.push({
          field: `files[${index}]`,
          message: `File type .${ext} not allowed. Allowed types: ${rules.allowedTypes.join(', ')}`
        });
      }
    });
  }
  
  if (rules.maxSize) {
    fileArray.forEach((file, index) => {
      if (file.size > rules.maxSize) {
        errors.push({
          field: `files[${index}]`,
          message: `File size exceeds maximum of ${rules.maxSize / 1024 / 1024}MB`
        });
      }
    });
  }
  
  return errors;
};

/**
 * Sanitize input - remove potentially dangerous characters
 */
const sanitize = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    // Remove HTML tags and script content
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Check content type for API requests
 */
const requireContentType = (contentTypes) => {
  return (req, res, next) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return next(new ApiError(400, 'Content-Type header is required'));
    }
    
    const isValid = contentTypes.some(type => contentType.includes(type));
    if (!isValid) {
      return next(new ApiError(415, `Content-Type must be one of: ${contentTypes.join(', ')}`));
    }
    
    next();
  };
};

/**
 * Validate UUID format
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate MongoDB ObjectId format
 */
const isValidObjectId = (id) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

module.exports = {
  validate,
  sanitize,
  requireContentType,
  isValidUUID,
  isValidObjectId,
  validationRules
};
