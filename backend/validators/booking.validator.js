const { body, param, query } = require('express-validator');

/**
 * Booking Validator - Request validation for booking routes
 */

// Create booking validation
const createBookingValidation = [
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID format'),
  
  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid date')
    .custom((value) => {
      const checkIn = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkIn < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  
  body('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid date')
    .custom((value, { req }) => {
      const checkIn = new Date(req.body.checkIn);
      const checkOut = new Date(value);
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
      // Minimum 1 night stay
      const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
      if (nights < 1) {
        throw new Error('Minimum stay is 1 night');
      }
      return true;
    }),
  
  body('guests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),
  
  body('guestInfo.firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('guestInfo.lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('guestInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('guestInfo.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('specialRequests')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),
  
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'cash', 'bank_transfer', 'paypal'])
    .withMessage('Invalid payment method'),
  
  body('source')
    .optional()
    .isIn(['website', 'phone', 'walk_in', 'booking.com', 'expedia', 'other'])
    .withMessage('Invalid booking source')
];

// Update booking validation
const updateBookingValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('checkIn')
    .optional()
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'])
    .withMessage('Invalid booking status'),
  
  body('guests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),
  
  body('specialRequests')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
];

// Booking ID validation
const bookingIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format')
];

// Booking query validation
const bookingQueryValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'])
    .withMessage('Invalid status filter'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

// Cancel booking validation
const cancelBookingValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('cancellationReason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters')
];

// Check-in validation
const checkInValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('idProof')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('ID proof must not exceed 100 characters')
];

// Check-out validation
const checkOutValidation = [
  param('id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'partial'])
    .withMessage('Invalid payment status')
];

module.exports = {
  createBookingValidation,
  updateBookingValidation,
  bookingIdValidation,
  bookingQueryValidation,
  cancelBookingValidation,
  checkInValidation,
  checkOutValidation
};
