const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Defines permissions for different roles
 */
const roles = {
  guest: [
    'read:own-bookings',
    'create:booking',
    'update:own-profile',
    'read:own-profile',
    'read:rooms',
    'read:activities',
    'create:feedback',
    'read:menu',
    'create:restaurant-reservation'
  ],
  staff: [
    'read:bookings',
    'update:bookings',
    'read:guests',
    'update:guests',
    'read:rooms',
    'update:rooms',
    'read:activities',
    'update:activities',
    'read:staff',
    'read:analytics',
    'create:feedback-response',
    'update:housekeeping',
    'update:maintenance'
  ],
  manager: [
    'read:all',
    'update:all',
    'delete:bookings',
    'delete:rooms',
    'read:staff',
    'update:staff',
    'create:staff',
    'delete:staff',
    'read:analytics',
    'export:reports',
    'update:pricing',
    'manage:promocodes'
  ],
  admin: [
    '*'
  ]
};

/**
 * Check if role has permission
 */
const hasPermission = (role, permission) => {
  if (!roles[role]) {
    return false;
  }

  // Admin has all permissions
  if (roles[role].includes('*')) {
    return true;
  }

  return roles[role].includes(permission);
};

/**
 * Middleware factory to check for specific permission
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role || 'guest';

    if (!hasPermission(userRole, permission)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Middleware factory to check for any of the specified permissions
 */
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role || 'guest';
    const hasAnyPermission = permissions.some(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasAnyPermission) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Middleware factory to check for all specified permissions
 */
const checkAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role || 'guest';
    const hasAllPermissions = permissions.every(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasAllPermissions) {
      return next(ApiError.forbidden('You do not have all required permissions'));
    }

    next();
  };
};

/**
 * Middleware to restrict access to specific roles
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this route'));
    }

    next();
  };
};

/**
 * Pre-defined permission middlewares
 */
const authMiddleware = {
  // Guest permissions
  createBooking: checkPermission('create:booking'),
  readOwnBookings: checkPermission('read:own-bookings'),
  updateOwnProfile: checkPermission('update:own-profile'),

  // Staff permissions
  readBookings: checkPermission('read:bookings'),
  updateBookings: checkPermission('update:bookings'),
  readGuests: checkPermission('read:guests'),
  updateRooms: checkPermission('update:rooms'),
  updateHousekeeping: checkPermission('update:housekeeping'),
  updateMaintenance: checkPermission('update:maintenance'),

  // Manager permissions
  readAll: checkPermission('read:all'),
  updateAll: checkPermission('update:all'),
  deleteBookings: checkPermission('delete:bookings'),
  manageStaff: checkPermission('update:staff'),
  readAnalytics: checkPermission('read:analytics'),
  exportReports: checkPermission('export:reports'),
  updatePricing: checkPermission('update:pricing'),

  // Admin permissions
  manageAll: checkPermission('*')
};

/**
 * Permission constants for easy reference
 */
const PERMISSIONS = {
  // Bookings
  CREATE_BOOKING: 'create:booking',
  READ_OWN_BOOKINGS: 'read:own-bookings',
  READ_BOOKINGS: 'read:bookings',
  UPDATE_BOOKINGS: 'update:bookings',
  DELETE_BOOKINGS: 'delete:bookings',

  // Rooms
  READ_ROOMS: 'read:rooms',
  UPDATE_ROOMS: 'update:rooms',
  DELETE_ROOMS: 'delete:rooms',

  // Guests
  READ_GUESTS: 'read:guests',
  UPDATE_GUESTS: 'update:guests',

  // Staff
  READ_STAFF: 'read:staff',
  CREATE_STAFF: 'create:staff',
  UPDATE_STAFF: 'update:staff',
  DELETE_STAFF: 'delete:staff',

  // Analytics
  READ_ANALYTICS: 'read:analytics',
  EXPORT_REPORTS: 'export:reports',

  // Pricing
  UPDATE_PRICING: 'update:pricing',

  // Profile
  READ_OWN_PROFILE: 'read:own-profile',
  UPDATE_OWN_PROFILE: 'update:own-profile',

  // Activities
  READ_ACTIVITIES: 'read:activities',
  UPDATE_ACTIVITIES: 'update:activities',

  // Feedback
  CREATE_FEEDBACK: 'create:feedback',
  READ_FEEDBACK: 'read:feedback',
  RESPOND_FEEDBACK: 'create:feedback-response'
};

module.exports = {
  hasPermission,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  restrictTo,
  authMiddleware,
  PERMISSIONS,
  roles
};
