const { body, param, query } = require('express-validator');

/**
 * Activity Validator - Request validation for activity routes
 */

// Create activity validation
const createActivityValidation = [
  body('name')
    .notEmpty()
    .withMessage('Activity name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Activity name must be between 2 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['water_sports', 'land_adventure', 'nature', 'cultural', 'wellness', 'entertainment', 'dining', 'other'])
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
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1'),
  
  body('minAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum age must be 0 or more'),
  
  body('maxAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum age must be 0 or more'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'challenging', 'extreme'])
    .withMessage('Invalid difficulty level'),
  
  body('location')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('schedule.days')
    .optional()
    .isArray()
    .withMessage('Schedule days must be an array'),
  
  body('schedule.days.*')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  
  body('schedule.startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('schedule.endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('includes')
    .optional()
    .isArray()
    .withMessage('Includes must be an array'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Update activity validation
const updateActivityValidation = [
  param('id')
    .notEmpty()
    .withMessage('Activity ID is required')
    .isMongoId()
    .withMessage('Invalid activity ID format'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Activity name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('category')
    .optional()
    .isIn(['water_sports', 'land_adventure', 'nature', 'cultural', 'wellness', 'entertainment', 'dining', 'other'])
    .withMessage('Invalid category'),
  
  body('duration')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'challenging', 'extreme'])
    .withMessage('Invalid difficulty level'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Activity ID validation
const activityIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Activity ID is required')
    .isMongoId()
    .withMessage('Invalid activity ID format')
];

// Activity query validation
const activityQueryValidation = [
  query('category')
    .optional()
    .isIn(['water_sports', 'land_adventure', 'nature', 'cultural', 'wellness', 'entertainment', 'dining', 'other'])
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'challenging', 'extreme'])
    .withMessage('Invalid difficulty level'),
  
  query('minAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum age must be 0 or more'),
  
  query('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Book activity validation
const bookActivityValidation = [
  param('id')
    .notEmpty()
    .withMessage('Activity ID is required')
    .isMongoId()
    .withMessage('Invalid activity ID format'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('participants')
    .notEmpty()
    .withMessage('Number of participants is required')
    .isInt({ min: 1 })
    .withMessage('Number of participants must be at least 1'),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:MM format'),
  
  body('specialRequests')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
];

module.exports = {
  createActivityValidation,
  updateActivityValidation,
  activityIdValidation,
  activityQueryValidation,
  bookActivityValidation
};
