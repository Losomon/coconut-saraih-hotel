/**
 * Application Constants
 */

// User Roles
const USER_ROLES = {
  GUEST: 'guest',
  STAFF: 'staff',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

// Room Types
const ROOM_TYPES = {
  STANDARD: 'standard',
  DELUXE: 'deluxe',
  SUITE: 'suite',
  PRESIDENTIAL: 'presidential'
};

// Room Status
const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning'
};

// Booking Status
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  CHECKED_OUT: 'checked-out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Payment Methods
const PAYMENT_METHODS = {
  CARD: 'card',
  MPESA: 'mpesa',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank-transfer',
  CASH: 'cash'
};

// Payment Gateways
const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  MPESA: 'mpesa'
};

// Booking Sources
const BOOKING_SOURCES = {
  WEB: 'web',
  MOBILE: 'mobile',
  PHONE: 'phone',
  WALK_IN: 'walk-in',
  TRAVEL_AGENT: 'travel-agent'
};

// Activity Categories
const ACTIVITY_CATEGORIES = {
  BEACH: 'beach',
  WATER_SPORTS: 'water-sports',
  TOURS: 'tours',
  ADVENTURE: 'adventure',
  CULTURAL: 'cultural',
  WELLNESS: 'wellness'
};

// Staff Departments
const STAFF_DEPARTMENTS = {
  RECEPTION: 'reception',
  HOUSEKEEPING: 'housekeeping',
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  MAINTENANCE: 'maintenance',
  SECURITY: 'security',
  MANAGEMENT: 'management'
};

// Staff Shifts
const STAFF_SHIFTS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night',
  ROTATING: 'rotating'
};

// Menu Categories
const MENU_CATEGORIES = {
  APPETIZER: 'appetizer',
  MAIN: 'main',
  DESSERT: 'dessert',
  BEVERAGE: 'beverage',
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner'
};

// Event Types
const EVENT_TYPES = {
  WEDDING: 'wedding',
  CONFERENCE: 'conference',
  PARTY: 'party',
  CORPORATE: 'corporate',
  OTHER: 'other'
};

// Feedback Types
const FEEDBACK_TYPES = {
  ROOM: 'room',
  RESTAURANT: 'restaurant',
  ACTIVITY: 'activity',
  SPA: 'spa',
  EVENT: 'event',
  GENERAL: 'general'
};

// Notification Types
const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
  SYSTEM: 'system'
};

// Notification Priority
const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Loyalty Tiers
const LOYALTY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

// Currencies
const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  KES: 'KES' // Kenyan Shilling
};

// Date/Time Formats
const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm'
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Token Expiry (in days)
const TOKEN_EXPIRY = {
  ACCESS: '15m',
  REFRESH: '7d',
  PASSWORD_RESET: '1h',
  EMAIL_VERIFICATION: '24h'
};

// Tax Rates
const TAX_RATES = {
  VAT: 0.16, // 16%
  SERVICE_FEE: 0.02, // 2%
  CITY_TAX: 0.05 // 5%
};

// File Upload
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  STORAGE_PATH: './uploads'
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// API Response Messages
const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_SENT: 'If the email exists, a reset link will be sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',

  // Bookings
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  CHECK_IN_SUCCESS: 'Check-in successful',
  CHECK_OUT_SUCCESS: 'Check-out successful',
  ROOM_NOT_AVAILABLE: 'Room not available for selected dates',

  // Payments
  PAYMENT_INITIATED: 'Payment initiated successfully',
  PAYMENT_SUCCESS: 'Payment successful',
  PAYMENT_FAILED: 'Payment failed',
  REFUND_PROCESSED: 'Refund processed successfully',

  // General
  SUCCESS: 'Success',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  VALIDATION_ERROR: 'Validation Error',
  SERVER_ERROR: 'Internal Server Error'
};

// Error Codes
const ERROR_CODES = {
  // 4xx Errors
  BAD_REQUEST: 'E400',
  UNAUTHORIZED: 'E401',
  FORBIDDEN: 'E403',
  NOT_FOUND: 'E404',
  CONFLICT: 'E409',
  VALIDATION_ERROR: 'E422',
  RATE_LIMIT_EXCEEDED: 'E429',

  // 5xx Errors
  INTERNAL_ERROR: 'E500',
  NOT_IMPLEMENTED: 'E501',
  SERVICE_UNAVAILABLE: 'E503'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503
};

module.exports = {
  USER_ROLES,
  ROOM_TYPES,
  ROOM_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_GATEWAYS,
  BOOKING_SOURCES,
  ACTIVITY_CATEGORIES,
  STAFF_DEPARTMENTS,
  STAFF_SHIFTS,
  MENU_CATEGORIES,
  EVENT_TYPES,
  FEEDBACK_TYPES,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  LOYALTY_TIERS,
  CURRENCIES,
  DATE_FORMATS,
  PAGINATION,
  TOKEN_EXPIRY,
  TAX_RATES,
  FILE_UPLOAD,
  CACHE_TTL,
  MESSAGES,
  ERROR_CODES,
  HTTP_STATUS
};
