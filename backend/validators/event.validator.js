const { body, param, query } = require('express-validator');

/**
 * Event Validator - Request validation for event routes
 */

// Create event validation
const createEventValidation = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Event name must be between 2 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Event type is required')
    .isIn(['conference', 'wedding', 'birthday', 'corporate', 'social', 'concert', 'exhibition', 'other'])
    .withMessage('Invalid event type'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const start = new Date(req.body.startDate);
      const end = new Date(value);
      if (end <= start) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('venue')
    .notEmpty()
    .withMessage('Venue is required')
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue must not exceed 200 characters'),
  
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'KES', 'TZS'])
    .withMessage('Invalid currency'),
  
  body('organizer')
    .optional()
    .isObject()
    .withMessage('Organizer must be an object'),
  
  body('organizer.name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organizer name must not exceed 100 characters'),
  
  body('organizer.email')
    .optional()
    .isEmail()
    .withMessage('Organizer email must be valid')
    .normalizeEmail(),
  
  body('organizer.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Organizer phone must be valid'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('requiresRegistration')
    .optional()
    .isBoolean()
    .withMessage('requiresRegistration must be a boolean'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array')
];

// Update event validation
const updateEventValidation = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID format'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Event name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('type')
    .optional()
    .isIn(['conference', 'wedding', 'birthday', 'corporate', 'social', 'concert', 'exhibition', 'other'])
    .withMessage('Invalid event type'),
  
  body('venue')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue must not exceed 200 characters'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Invalid status')
];

// Event ID validation
const eventIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID format')
];

// Event query validation
const eventQueryValidation = [
  query('type')
    .optional()
    .isIn(['conference', 'wedding', 'birthday', 'corporate', 'social', 'concert', 'exhibition', 'other'])
    .withMessage('Invalid event type'),
  
  query('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Event hall validation
const createEventHallValidation = [
  body('name')
    .notEmpty()
    .withMessage('Hall name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hall name must be between 2 and 100 characters'),
  
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  body('floor')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Floor must be at least 1'),
  
  body('size')
    .optional()
    .isInt({ min: 10 })
    .withMessage('Size must be at least 10 sq meters'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  
  body('dailyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rate must be a positive number')
];

// Book event validation
const bookEventValidation = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID format'),
  
  body('attendees')
    .notEmpty()
    .withMessage('Number of attendees is required')
    .isInt({ min: 1 })
    .withMessage('Attendees must be at least 1'),
  
  body('contactName')
    .notEmpty()
    .withMessage('Contact name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 }),
  
  body('contactEmail')
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .normalizeEmail(),
  
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .isMobilePhone('any'),
  
  body('specialRequirements')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
];

module.exports = {
  createEventValidation,
  updateEventValidation,
  eventIdValidation,
  eventQueryValidation,
  createEventHallValidation,
  bookEventValidation
};
