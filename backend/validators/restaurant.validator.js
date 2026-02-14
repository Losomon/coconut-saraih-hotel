const { body, param, query } = require('express-validator');

/**
 * Restaurant Validator - Request validation for restaurant routes
 */

// Create menu item validation
const createMenuItemValidation = [
  body('name')
    .notEmpty()
    .withMessage('Item name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'snack', 'breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid category'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'KES', 'TZS'])
    .withMessage('Invalid currency'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Preparation time must be at least 1 minute'),
  
  body('calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories must be a positive integer'),
  
  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('Vegetarian must be a boolean'),
  
  body('isVegan')
    .optional()
    .isBoolean()
    .withMessage('Vegan must be a boolean'),
  
  body('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('Gluten free must be a boolean'),
  
  body('isSpicy')
    .optional()
    .isBoolean()
    .withMessage('Spicy must be a boolean'),
  
  body('contains')
    .optional()
    .isArray()
    .withMessage('Contains must be an array'),
  
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

// Update menu item validation
const updateMenuItemValidation = [
  param('id')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
  
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'snack', 'breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid category'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

// Menu item ID validation
const menuItemIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid menu item ID format')
];

// Menu query validation
const menuQueryValidation = [
  query('category')
    .optional()
    .isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'snack', 'breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('Vegetarian must be a boolean'),
  
  query('isVegan')
    .optional()
    .isBoolean()
    .withMessage('Vegan must be a boolean'),
  
  query('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('Gluten free must be a boolean'),
  
  query('isSpicy')
    .optional()
    .isBoolean()
    .withMessage('Spicy must be a boolean'),
  
  query('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Table reservation validation
const createTableReservationValidation = [
  body('restaurantId')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isMongoId()
    .withMessage('Invalid restaurant ID format'),
  
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
  
  body('partySize')
    .notEmpty()
    .withMessage('Party size is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Party size must be between 1 and 20'),
  
  body('guestName')
    .notEmpty()
    .withMessage('Guest name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters'),
  
  body('guestEmail')
    .notEmpty()
    .withMessage('Guest email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('guestPhone')
    .notEmpty()
    .withMessage('Guest phone is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('specialRequests')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
];

// Order validation
const createOrderValidation = [
  body('items')
    .notEmpty()
    .withMessage('Order items are required')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid menu item ID format'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.specialInstructions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Special instructions must not exceed 200 characters'),
  
  body('orderType')
    .notEmpty()
    .withMessage('Order type is required')
    .isIn(['dine_in', 'takeout', 'delivery'])
    .withMessage('Invalid order type'),
  
  body('tableNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Table number must be a positive integer'),
  
  body('deliveryAddress')
    .optional()
    .isObject()
    .withMessage('Delivery address must be an object'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'mobile_money'])
    .withMessage('Invalid payment method')
];

module.exports = {
  createMenuItemValidation,
  updateMenuItemValidation,
  menuItemIdValidation,
  menuQueryValidation,
  createTableReservationValidation,
  createOrderValidation
};
