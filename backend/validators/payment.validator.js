const { body, param, query } = require('express-validator');

/**
 * Payment Validator - Request validation for payment routes
 */

// Create payment validation
const createPaymentValidation = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'KES', 'TZS'])
    .withMessage('Invalid currency'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'cash', 'bank_transfer', 'mobile_money', 'paypal'])
    .withMessage('Invalid payment method'),
  
  body('transactionId')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must not exceed 100 characters'),
  
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('customerName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Customer name must not exceed 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

// Process payment validation
const processPaymentValidation = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'paypal'])
    .withMessage('Invalid payment method'),
  
  body('cardNumber')
    .optional()
    .isCreditCard()
    .withMessage('Invalid card number'),
  
  body('cardHolder')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Card holder name must be between 2 and 100 characters'),
  
  body('expiryMonth')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Expiry month must be between 1 and 12'),
  
  body('expiryYear')
    .optional()
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Expiry year must be current or future'),
  
  body('cvv')
    .optional()
    .isLength({ min: 3, max: 4 })
    .withMessage('CVV must be 3 or 4 digits')
];

// Refund validation
const refundPaymentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid payment ID format'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be a positive number'),
  
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Refund reason must be between 10 and 500 characters')
];

// Payment ID validation
const paymentIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid payment ID format')
];

// Payment query validation
const paymentQueryValidation = [
  query('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID format'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
    .withMessage('Invalid status'),
  
  query('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'cash', 'bank_transfer', 'mobile_money', 'paypal'])
    .withMessage('Invalid payment method'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Webhook validation
const webhookValidation = [
  body('event')
    .notEmpty()
    .withMessage('Event type is required')
    .isString()
    .trim(),
  
  body('data')
    .notEmpty()
    .withMessage('Event data is required')
    .isObject()
    .withMessage('Event data must be an object'),
  
  body('signature')
    .notEmpty()
    .withMessage('Webhook signature is required')
    .isString()
    .trim()
];

// Payment intent validation
const paymentIntentValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'KES', 'TZS'])
    .withMessage('Invalid currency'),
  
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

module.exports = {
  createPaymentValidation,
  processPaymentValidation,
  refundPaymentValidation,
  paymentIdValidation,
  paymentQueryValidation,
  webhookValidation,
  paymentIntentValidation
};
