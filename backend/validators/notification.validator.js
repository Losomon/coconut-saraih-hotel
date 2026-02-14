const { body, param, query } = require('express-validator');

/**
 * Notification Validator - Request validation for notification routes
 */

// Create notification validation
const createNotificationValidation = [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isMongoId()
    .withMessage('Invalid recipient ID format'),
  
  body('type')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn(['booking', 'payment', 'check_in', 'check_out', 'reminder', 'promotion', 'system', 'feedback', 'message', 'alert', 'other'])
    .withMessage('Invalid notification type'),
  
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
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5 and 1000 characters'),
  
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  
  body('channels')
    .optional()
    .isObject()
    .withMessage('Channels must be an object'),
  
  body('channels.inApp')
    .optional()
    .isBoolean()
    .withMessage('inApp must be a boolean'),
  
  body('channels.email')
    .optional()
    .isBoolean()
    .withMessage('email must be a boolean'),
  
  body('channels.sms')
    .optional()
    .isBoolean()
    .withMessage('sms must be a boolean'),
  
  body('channels.push')
    .optional()
    .isBoolean()
    .withMessage('push must be a boolean')
];

// Send bulk notification validation
const sendBulkNotificationValidation = [
  body('userIds')
    .notEmpty()
    .withMessage('User IDs are required')
    .isArray({ min: 1 })
    .withMessage('At least one user ID is required'),
  
  body('userIds.*')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  body('type')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn(['booking', 'payment', 'check_in', 'check_out', 'reminder', 'promotion', 'system', 'feedback', 'message', 'alert', 'other'])
    .withMessage('Invalid notification type'),
  
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
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5 and 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

// Send system notification validation
const sendSystemNotificationValidation = [
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
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5 and 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  
  body('targetRoles')
    .optional()
    .isArray()
    .withMessage('Target roles must be an array'),
  
  body('targetRoles.*')
    .optional()
    .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bartender', 'security', 'spa_therapist', 'bellboy', 'concierge', 'guest'])
    .withMessage('Invalid role')
];

// Notification ID validation
const notificationIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isMongoId()
    .withMessage('Invalid notification ID format')
];

// Notification query validation
const notificationQueryValidation = [
  query('type')
    .optional()
    .isIn(['booking', 'payment', 'check_in', 'check_out', 'reminder', 'promotion', 'system', 'feedback', 'message', 'alert', 'other'])
    .withMessage('Invalid notification type'),
  
  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('unreadOnly must be a boolean'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  
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

// Update preferences validation
const updatePreferencesValidation = [
  body('email')
    .optional()
    .isBoolean()
    .withMessage('Email must be a boolean'),
  
  body('sms')
    .optional()
    .isBoolean()
    .withMessage('SMS must be a boolean'),
  
  body('push')
    .optional()
    .isBoolean()
    .withMessage('Push must be a boolean'),
  
  body('bookingReminders')
    .optional()
    .isBoolean()
    .withMessage('bookingReminders must be a boolean'),
  
  body('promotions')
    .optional()
    .isBoolean()
    .withMessage('promotions must be a boolean'),
  
  body('marketing')
    .optional()
    .isBoolean()
    .withMessage('marketing must be a boolean')
];

// Mark as read validation
const markAsReadValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isMongoId()
    .withMessage('Invalid notification ID format')
];

module.exports = {
  createNotificationValidation,
  sendBulkNotificationValidation,
  sendSystemNotificationValidation,
  notificationIdValidation,
  notificationQueryValidation,
  updatePreferencesValidation,
  markAsReadValidation
};
