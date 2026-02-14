const { body, param, query } = require('express-validator');

/**
 * Staff Validator - Request validation for staff routes
 */

// Create staff validation
const createStaffValidation = [
  body('personalInfo.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('personalInfo.lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bartender', 'security', 'spa_therapist', 'bellboy', 'concierge'])
    .withMessage('Invalid role'),
  
  body('department')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department must not exceed 50 characters'),
  
  body('position')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Position must not exceed 50 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  
  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('Emergency contact must be an object'),
  
  body('emergencyContact.name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must not exceed 100 characters'),
  
  body('emergencyContact.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Emergency contact phone must be valid'),
  
  body('emergencyContact.relationship')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Relationship must not exceed 50 characters')
];

// Update staff validation
const updateStaffValidation = [
  param('id')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID format'),
  
  body('personalInfo')
    .optional()
    .isObject()
    .withMessage('Personal info must be an object'),
  
  body('personalInfo.firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('personalInfo.lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bartender', 'security', 'spa_therapist', 'bellboy', 'concierge'])
    .withMessage('Invalid role'),
  
  body('department')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department must not exceed 50 characters'),
  
  body('position')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Position must not exceed 50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on_leave', 'terminated'])
    .withMessage('Invalid status'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Staff ID validation
const staffIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID format')
];

// Staff query validation
const staffQueryValidation = [
  query('role')
    .optional()
    .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bartender', 'security', 'spa_therapist', 'bellboy', 'concierge'])
    .withMessage('Invalid role'),
  
  query('department')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department must not exceed 50 characters'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'on_leave', 'terminated'])
    .withMessage('Invalid status'),
  
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Update role validation
const updateRoleValidation = [
  param('id')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID format'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bartender', 'security', 'spa_therapist', 'bellboy', 'concierge'])
    .withMessage('Invalid role')
];

// Schedule shift validation
const scheduleShiftValidation = [
  param('id')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isMongoId()
    .withMessage('Invalid staff ID format'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters')
];

module.exports = {
  createStaffValidation,
  updateStaffValidation,
  staffIdValidation,
  staffQueryValidation,
  updateRoleValidation,
  scheduleShiftValidation
};
