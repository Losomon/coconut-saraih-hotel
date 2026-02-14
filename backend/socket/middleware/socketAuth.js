/**
 * Socket Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Socket authentication middleware factory
 */
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Attach user to socket
    socket.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    // Allow guest connections for some functionality
    if (socket.handshake.query.guest === 'true') {
      socket.user = { 
        id: `guest_${socket.id}`, 
        role: 'guest',
        isGuest: true 
      };
      return next();
    }
    
    next(new Error('Invalid or expired token'));
  }
};

/**
 * Optional auth - doesn't require authentication but attaches user if available
 */
const socketOptionalAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    } else {
      socket.user = { 
        id: `guest_${socket.id}`, 
        role: 'guest',
        isGuest: true 
      };
    }
    
    next();
  } catch (error) {
    // Attach guest user if token is invalid
    socket.user = { 
      id: `guest_${socket.id}`, 
      role: 'guest',
      isGuest: true 
    };
    next();
  }
};

/**
 * Admin-only socket middleware
 */
const requireAdmin = async (socket, next) => {
  if (!socket.user) {
    return next(new Error('Authentication required'));
  }
  
  if (socket.user.role !== 'admin' && socket.user.role !== 'manager') {
    return next(new Error('Admin access required'));
  }
  
  next();
};

/**
 * Staff or Admin middleware
 */
const requireStaff = async (socket, next) => {
  if (!socket.user) {
    return next(new Error('Authentication required'));
  }
  
  const allowedRoles = ['admin', 'manager', 'staff'];
  if (!allowedRoles.includes(socket.user.role)) {
    return next(new Error('Staff access required'));
  }
  
  next();
};

/**
 * Rate limiting middleware for socket connections
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute
    maxConnections = 30
  } = options;
  
  const connections = new Map();
  
  return (socket, next) => {
    const now = Date.now();
    const userId = socket.user?.id || socket.id;
    
    if (!connections.has(userId)) {
      connections.set(userId, []);
    }
    
    const userConnections = connections.get(userId);
    const recentConnections = userConnections.filter(
      time => now - time < windowMs
    );
    
    if (recentConnections.length >= maxConnections) {
      return next(new Error('Too many connections. Please try again later.'));
    }
    
    recentConnections.push(now);
    connections.set(userId, recentConnections);
    
    // Cleanup old entries periodically
    if (connections.size > 10000) {
      for (const [key, times] of connections.entries()) {
        const active = times.filter(time => now - time < windowMs);
        if (active.length === 0) {
          connections.delete(key);
        } else {
          connections.set(key, active);
        }
      }
    }
    
    next();
  };
};

/**
 * Check if user can access a specific booking
 */
const canAccessBooking = async (socket, bookingId, next) => {
  try {
    // Admin/Manager can access all bookings
    if (socket.user.role === 'admin' || socket.user.role === 'manager') {
      return next();
    }
    
    // For guests, we'd need to check booking ownership
    // This would require database access
    // For now, allow access and let the handler verify
    
    next();
  } catch (error) {
    next(new Error('Authorization failed'));
  }
};

/**
 * Log socket connection for debugging
 */
const createConnectionLogger = (logger) => {
  return (socket, next) => {
    const userId = socket.user?.id || 'guest';
    const ip = socket.handshake.address || 'unknown';
    
    logger.info(`Socket connection: ${socket.id}`, {
      userId,
      ip,
      userAgent: socket.handshake.headers['user-agent']
    });
    
    next();
  };
};

module.exports = {
  socketAuth,
  socketOptionalAuth,
  requireAdmin,
  requireStaff,
  createRateLimiter,
  canAccessBooking,
  createConnectionLogger
};
