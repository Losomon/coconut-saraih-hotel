const { body, param, query } = require('express-validator');

/**
 * Feedback Validator - Request validation for feedback routes
 */

// Create feedback validation
const createFeedbackValidation = [
  body('type')
    .notEmpty()
    .withMessage('Feedback type is required')
    .isIn(['compliment', 'complaint', 'suggestion', 'bug_report', 'other'])
    .withMessage('Invalid feedback type'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['room', 'restaurant', 'service', 'facility', 'staff', 'cleanliness', 'amenities', 'other'])
    .withMessage('Invalid category'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('guestId')
    .optional()
    .isMongoId()
    .withMessage('Invalid guest ID format'),
  
  body('staffId')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID format'),
  
  body('roomId')
    .optional()
    .isMongoId()
    .withMessage('Invalid room ID format'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  
  body('attachments.*')
    .optional()
    .isURL()
    .withMessage('Each attachment must be a valid URL'),
  
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

// Update feedback validation
const updateFeedbackValidation = [
  param('id')
    .notEmpty()
    .withMessage('Feedback ID is required')
    .isMongoId()
    .withMessage('Invalid feedback ID format'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  
  body('response')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Response must not exceed 2000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

// Feedback ID validation
const feedbackIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Feedback ID is required')
    .isMongoId()
    .withMessage('Invalid feedback ID format')
];

// Feedback query validation
const feedbackQueryValidation = [
  query('type')
    .optional()
    .isIn(['compliment', 'complaint', 'suggestion', 'bug_report', 'other'])
    .withMessage('Invalid feedback type'),
  
  query('category')
    .optional()
    .isIn(['room', 'restaurant', 'service', 'facility', 'staff', 'cleanliness', 'amenities', 'other'])
    .withMessage('Invalid category'),
  
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Respond to feedback validation
const respondToFeedbackValidation = [
  param('id')
    .notEmpty()
    .withMessage('Feedback ID is required')
    .isMongoId()
    .withMessage('Invalid feedback ID format'),
  
  body('response')
    .notEmpty()
    .withMessage('Response is required')
    .isString()
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Response must be between 5 and 2000 characters')
];

module.exports = {
  createFeedbackValidation,
  updateFeedbackValidation,
  feedbackIdValidation,
  feedbackQueryValidation,
  respondToFeedbackValidation
};
