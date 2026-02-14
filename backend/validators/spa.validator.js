const { body, param, query } = require('express-validator');

/**
 * Spa Validator - Request validation for spa routes
 */

// Create spa service validation
const createServiceValidation = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['massage', 'facial', 'body_treatment', 'aromatherapy', 'hydrotherapy', 'beauty', 'yoga', 'meditation', 'other'])
    .withMessage('Invalid category'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'KES', 'TZS'])
    .withMessage('Invalid currency'),
  
  body('therapist')
    .optional()
    .isMongoId()
    .withMessage('Invalid therapist ID format'),
  
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  
  body('contraindications')
    .optional()
    .isArray()
    .withMessage('Contraindications must be an array'),
  
  body('aftercare')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Aftercare must not exceed 500 characters'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

// Update spa service validation
const updateServiceValidation = [
  param('id')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID format'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('category')
    .optional()
    .isIn(['massage', 'facial', 'body_treatment', 'aromatherapy', 'hydrotherapy', 'beauty', 'yoga', 'meditation', 'other'])
    .withMessage('Invalid category'),
  
  body('duration')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('therapist')
    .optional()
    .isMongoId()
    .withMessage('Invalid therapist ID format'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

// Service ID validation
const serviceIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID format')
];

// Service query validation
const serviceQueryValidation = [
  query('category')
    .optional()
    .isIn(['massage', 'facial', 'body_treatment', 'aromatherapy', 'hydrotherapy', 'beauty', 'yoga', 'meditation', 'other'])
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('minDuration')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Minimum duration must be at least 15 minutes'),
  
  query('therapist')
    .optional()
    .isMongoId()
    .withMessage('Invalid therapist ID format'),
  
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Check availability validation
const checkAvailabilityValidation = [
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  query('therapistId')
    .optional()
    .isMongoId()
    .withMessage('Invalid therapist ID format'),
  
  query('serviceId')
    .optional()
    .isMongoId()
    .withMessage('Invalid service ID format')
];

// Book spa service validation
const bookServiceValidation = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID format'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:MM format'),
  
  body('therapistId')
    .optional()
    .isMongoId()
    .withMessage('Invalid therapist ID format'),
  
  body('specialRequests')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),
  
  body('guestInfo')
    .optional()
    .isObject()
    .withMessage('Guest info must be an object'),
  
  body('guestInfo.name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('guestInfo.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('guestInfo.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format')
];

module.exports = {
  createServiceValidation,
  updateServiceValidation,
  serviceIdValidation,
  serviceQueryValidation,
  checkAvailabilityValidation,
  bookServiceValidation
};
