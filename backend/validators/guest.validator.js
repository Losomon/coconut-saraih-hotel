const { body, param, query } = require('express-validator');

/**
 * Guest Validator - Request validation for guest routes
 */

// Create guest validation
const createGuestValidation = [
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
  
  body('personalInfo.email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('personalInfo.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('personalInfo.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  body('personalInfo.gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender'),
  
  body('personalInfo.nationality')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Nationality must not exceed 50 characters'),
  
  body('personalInfo.idType')
    .optional()
    .isIn(['passport', 'national_id', 'drivers_license', 'other'])
    .withMessage('Invalid ID type'),
  
  body('personalInfo.idNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('ID number must not exceed 50 characters'),
  
  body('personalInfo.address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  
  body('personalInfo.address.street')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street must not exceed 200 characters'),
  
  body('personalInfo.address.city')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  
  body('personalInfo.address.state')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('personalInfo.address.country')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  
  body('personalInfo.address.zipCode')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must not exceed 20 characters'),
  
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('preferences.roomType')
    .optional()
    .isIn(['standard', 'deluxe', 'suite', 'family', 'executive', 'presidential'])
    .withMessage('Invalid room type preference'),
  
  body('preferences.dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  
  body('preferences.smokingRoom')
    .optional()
    .isBoolean()
    .withMessage('Smoking room preference must be a boolean'),
  
  body('loyaltyInfo')
    .optional()
    .isObject()
    .withMessage('Loyalty info must be an object'),
  
  body('loyaltyInfo.points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Loyalty points must be a positive integer'),
  
  body('loyaltyInfo.tier')
    .optional()
    .isIn(['bronze', 'silver', 'gold', 'platinum', 'diamond'])
    .withMessage('Invalid loyalty tier')
];

// Update guest validation
const updateGuestValidation = [
  param('id')
    .notEmpty()
    .withMessage('Guest ID is required')
    .isMongoId()
    .withMessage('Invalid guest ID format'),
  
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
  
  body('personalInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('personalInfo.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

// Guest ID validation
const guestIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Guest ID is required')
    .isMongoId()
    .withMessage('Invalid guest ID format')
];

// Guest query validation
const guestQueryValidation = [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
  
  query('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  query('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone format'),
  
  query('tier')
    .optional()
    .isIn(['bronze', 'silver', 'gold', 'platinum', 'diamond'])
    .withMessage('Invalid loyalty tier'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Add preference validation
const addPreferenceValidation = [
  param('id')
    .notEmpty()
    .withMessage('Guest ID is required')
    .isMongoId()
    .withMessage('Invalid guest ID format'),
  
  body('key')
    .notEmpty()
    .withMessage('Preference key is required')
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Preference key must not exceed 50 characters'),
  
  body('value')
    .notEmpty()
    .withMessage('Preference value is required')
];

module.exports = {
  createGuestValidation,
  updateGuestValidation,
  guestIdValidation,
  guestQueryValidation,
  addPreferenceValidation
};
