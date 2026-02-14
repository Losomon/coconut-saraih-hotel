/**
 * Socket.io Setup
 * Main entry point for socket functionality
 */

const { Server } = require('socket.io');
const config = require('../config');

// Import handlers
const { registerBookingHandlers } = require('./handlers/booking.handler');
const { registerNotificationHandlers } = require('./handlers/notification.handler');
const { registerChatHandlers } = require('./handlers/chat.handler');

// Import middleware
const { 
  socketAuth, 
  socketOptionalAuth, 
  requireAdmin,
  requireStaff,
  createRateLimiter,
  createConnectionLogger
} = require('./middleware/socketAuth');

// Import logger
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.io server
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: config.socket.cors,
    pingTimeout: config.socket.pingTimeout || 60000,
    pingInterval: config.socket.pingInterval || 25000,
    transports: config.socket.transports || ['websocket', 'polling'],
    allowEIO3: true,
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 1024
    }
  });

  // Apply logging middleware
  io.use(createConnectionLogger(logger));

  // Apply authentication middleware
  io.use(socketOptionalAuth);

  // Apply rate limiting
  io.use(createRateLimiter({
    windowMs: 60000, // 1 minute
    maxConnections: 30
  }));

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.user?.id || 'guest'}`);
    
    // Join user's personal room
    if (socket.user && socket.user.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Register event handlers
    registerBookingHandlers(io, socket);
    registerNotificationHandlers(io, socket);
    registerChatHandlers(io, socket);

    // Handle room availability subscription
    socket.on('room:subscribe', (data) => handleRoomSubscription(socket, data));
    socket.on('room:unsubscribe', (data) => handleRoomUnsubscription(socket, data));

    // Handle general events
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });
  });

  // Setup admin namespace
  setupAdminNamespace(io);

  // Setup guest namespace for public features
  setupGuestNamespace(io);

  console.log('Socket.io server initialized with modular handlers');
  return io;
};

/**
 * Handle room availability subscription
 */
const handleRoomSubscription = (socket, data) => {
  const { roomId } = data;
  
  if (!roomId) {
    socket.emit('error', { message: 'Room ID required' });
    return;
  }

  const room = `room:${roomId}`;
  socket.join(room);
  
  console.log(`Socket ${socket.id} subscribed to room ${roomId}`);
  
  socket.emit('room:subscribed', { roomId });
};

/**
 * Handle room unsubscription
 */
const handleRoomUnsubscription = (socket, data) => {
  const { roomId } = data;
  
  if (!roomId) return;

  const room = `room:${roomId}`;
  socket.leave(room);
  
  console.log(`Socket ${socket.id} unsubscribed from room ${roomId}`);
};

/**
 * Setup admin namespace
 */
const setupAdminNamespace = (io) => {
  const adminNamespace = io.of(config.socket?.namespace?.admin || '/admin');
  
  adminNamespace.use(async (socket, next) => {
    // Check admin role
    if (socket.user?.role !== 'admin' && socket.user?.role !== 'manager') {
      return next(new Error('Unauthorized - Admin access required'));
    }
    next();
  });

  adminNamespace.on('connection', (socket) => {
    console.log(`Admin socket connected: ${socket.id}`);
    
    // Join admin dashboard room
    socket.join('dashboard');
    
    // Handle admin-specific events
    socket.on('dashboard:subscribe', () => {
      socket.join('dashboard');
      socket.emit('dashboard:subscribed');
    });

    socket.on('dashboard:unsubscribe', () => {
      socket.leave('dashboard');
    });

    // Handle analytics real-time updates
    socket.on('analytics:request', (data) => {
      handleAnalyticsRequest(socket, data);
    });
  });
};

/**
 * Setup guest namespace for public features
 */
const setupGuestNamespace = (io) => {
  const guestNamespace = io.of(config.socket?.namespace?.guest || '/guest');
  
  guestNamespace.use(async (socket, next) => {
    // Allow guests but attach limited user info
    socket.user = {
      id: `guest_${socket.id}`,
      role: 'guest',
      isGuest: true
    };
    next();
  });

  guestNamespace.on('connection', (socket) => {
    console.log(`Guest socket connected: ${socket.id}`);
    
    // Handle room availability requests
    socket.on('rooms:availability', (data) => {
      handleGuestRoomAvailability(socket, data);
    });

    // Handle general inquiry
    socket.on('inquiry:send', (data) => {
      handleGuestInquiry(socket, data);
    });
  });
};

/**
 * Handle analytics request from admin
 */
const handleAnalyticsRequest = async (socket, data) => {
  const { type, dateRange } = data;
  
  try {
    // This would fetch real analytics data
    // For now, return placeholder
    socket.emit('analytics:data', {
      type,
      dateRange,
      data: {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    socket.emit('analytics:error', {
      message: 'Failed to fetch analytics data'
    });
  }
};

/**
 * Handle guest room availability request
 */
const handleGuestRoomAvailability = async (socket, data) => {
  const { checkIn, checkOut, roomType } = data;
  
  try {
    // This would query actual room availability
    // For now, return placeholder
    socket.emit('rooms:availability_data', {
      available: true,
      rooms: [],
      checkIn,
      checkOut,
      roomType
    });
  } catch (error) {
    socket.emit('rooms:error', {
      message: 'Failed to fetch room availability'
    });
  }
};

/**
 * Handle guest inquiry
 */
const handleGuestInquiry = async (socket, data) => {
  const { name, email, message, type } = data;
  
  try {
    // Validate required fields
    if (!name || !email || !message) {
      socket.emit('inquiry:error', {
        message: 'Name, email, and message are required'
      });
      return;
    }

    // This would save to database and notify staff
    // For now, acknowledge
    socket.emit('inquiry:received', {
      message: 'Thank you for your inquiry. We will get back to you soon!',
      timestamp: new Date().toISOString()
    });

    // Notify admin
    io.of('/admin').to('dashboard').emit('dashboard:new_inquiry', {
      name,
      email,
      message,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    socket.emit('inquiry:error', {
      message: 'Failed to send inquiry'
    });
  }
};

/**
 * Get Socket.io instance
 */
const getIO = () => io;

/**
 * Emit to specific user
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit to all connected clients
 */
const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

/**
 * Emit to specific room
 */
const emitToRoom = (room, event, data) => {
  if (!io) return;
  io.to(room).emit(event, data);
};

/**
 * Emit booking update
 */
const emitBookingUpdate = (bookingId, update) => {
  emitToRoom(`booking:${bookingId}`, 'booking:update', {
    ...update,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit room availability update
 */
const emitRoomAvailability = (roomId, availability) => {
  emitToRoom(`room:${roomId}`, 'room:availability', {
    ...availability,
    timestamp: new Date().toISOString()
  });
  
  // Also emit to any guests watching
  io.of('/guest').emit('rooms:availability_update', {
    roomId,
    ...availability
  });
};

/**
 * Emit notification to user
 */
const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification:new', {
    ...notification,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit real-time dashboard update
 */
const emitDashboardUpdate = (type, data) => {
  if (!io) return;
  
  // Emit to admin namespace
  io.of('/admin').to('dashboard').emit(`dashboard:${type}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
  
  // Also emit to main admin room
  io.to('admin:dashboard').emit(`dashboard:${type}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Emit chat message
 */
const emitChatMessage = (roomId, message) => {
  emitToRoom(`chat:${roomId}`, 'chat:message', message);
};

/**
 * Broadcast system message
 */
const emitSystemMessage = (message, target = 'all') => {
  const systemMessage = {
    id: require('crypto').randomUUID(),
    type: 'system',
    message,
    timestamp: new Date().toISOString()
  };

  if (target === 'all') {
    emitToAll('chat:system_message', systemMessage);
  } else if (target === 'admin') {
    io.of('/admin').to('dashboard').emit('chat:system_message', systemMessage);
  } else if (target === 'guests') {
    io.of('/guest').emit('chat:system_message', systemMessage);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAll,
  emitToRoom,
  emitBookingUpdate,
  emitRoomAvailability,
  emitNotification,
  emitDashboardUpdate,
  emitChatMessage,
  emitSystemMessage
};
