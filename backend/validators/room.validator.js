const { body, param, query } = require('express-validator');

/**
 * Room Validator - Request validation for room routes
 */

// Create room validation
const createRoomValidation = [
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Room type is required')
    .isIn(['standard', 'deluxe', 'suite', 'family', 'executive', 'presidential'])
    .withMessage('Invalid room type'),
  
  body('floor')
    .notEmpty()
    .withMessage('Floor is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Capacity must be between 1 and 10 guests'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each amenity must not exceed 50 characters'),
  
  body('size')
    .optional()
    .isInt({ min: 10 })
    .withMessage('Room size must be at least 10 sq meters'),
  
  body('bedType')
    .optional()
    .isIn(['single', 'twin', 'double', 'queen', 'king', 'suite'])
    .withMessage('Invalid bed type'),
  
  body('view')
    .optional()
    .isIn(['city', 'sea', 'garden', 'pool', 'mountain', 'none'])
    .withMessage('Invalid view type'),
  
  body('smokingAllowed')
    .optional()
    .isBoolean()
    .withMessage('Smoking allowed must be a boolean'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

// Update room validation
const updateRoomValidation = [
  param('id')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID format'),
  
  body('roomNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters'),
  
  body('type')
    .optional()
    .isIn(['standard', 'deluxe', 'suite', 'family', 'executive', 'presidential'])
    .withMessage('Invalid room type'),
  
  body('floor')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Capacity must be between 1 and 10 guests'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('size')
    .optional()
    .isInt({ min: 10 })
    .withMessage('Room size must be at least 10 sq meters'),
  
  body('bedType')
    .optional()
    .isIn(['single', 'twin', 'double', 'queen', 'king', 'suite'])
    .withMessage('Invalid bed type'),
  
  body('view')
    .optional()
    .isIn(['city', 'sea', 'garden', 'pool', 'mountain', 'none'])
    .withMessage('Invalid view type'),
  
  body('smokingAllowed')
    .optional()
    .isBoolean()
    .withMessage('Smoking allowed must be a boolean'),
  
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'cleaning', 'reserved'])
    .withMessage('Invalid room status'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Room ID validation
const roomIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID format')
];

// Room query validation
const roomQueryValidation = [
  query('type')
    .optional()
    .isIn(['standard', 'deluxe', 'suite', 'family', 'executive', 'presidential'])
    .withMessage('Invalid room type'),
  
  query('floor')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  query('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean'),
  
  query('bedType')
    .optional()
    .isIn(['single', 'twin', 'double', 'queen', 'king', 'suite'])
    .withMessage('Invalid bed type'),
  
  query('view')
    .optional()
    .isIn(['city', 'sea', 'garden', 'pool', 'mountain', 'none'])
    .withMessage('Invalid view type'),
  
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
  query('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  
  query('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid date')
    .custom((value, { req }) => {
      const checkIn = new Date(req.query.checkIn);
      const checkOut = new Date(value);
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  
  query('guests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Room type validation
const roomTypeValidation = [
  body('type')
    .notEmpty()
    .withMessage('Room type is required')
    .isIn(['standard', 'deluxe', 'suite', 'family', 'executive', 'presidential'])
    .withMessage('Invalid room type'),
  
  body('basePrice')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('maxCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum capacity must be at least 1'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array')
];

module.exports = {
  createRoomValidation,
  updateRoomValidation,
  roomIdValidation,
  roomQueryValidation,
  checkAvailabilityValidation,
  roomTypeValidation
};
