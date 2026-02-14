/**
 * Socket.io Configuration
 */

const { Server } = require('socket.io');
const config = require('./index');

let io = null;

/**
 * Initialize Socket.io server
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: config.socket.cors,
    pingTimeout: config.socket.pingTimeout,
    pingInterval: config.socket.pingInterval,
    transports: config.socket.transports,
    allowEIO3: true,
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 1024
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify token (will be implemented in auth middleware)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, config.jwt.secret);
      
      socket.user = decoded;
      next();
    } catch (error) {
      // Allow unauthenticated connections for some namespaces
      if (socket.handshake.query.guest === 'true') {
        socket.user = { id: 'guest', role: 'guest' };
        return next();
      }
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.user?.id || 'guest'}`);
    
    // Join user's personal room
    if (socket.user && socket.user.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Handle room subscriptions
    socket.on('room:subscribe', (data) => {
      handleRoomSubscription(socket, data);
    });

    socket.on('room:unsubscribe', (data) => {
      handleRoomUnsubscription(socket, data);
    });

    // Handle booking subscriptions
    socket.on('booking:subscribe', (data) => {
      handleBookingSubscription(socket, data);
    });

    // Handle chat messages
    socket.on('chat:message', (data) => {
      handleChatMessage(socket, data);
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(data.room).emit('typing:indicator', { user: socket.user, isTyping: true });
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.room).emit('typing:indicator', { user: socket.user, isTyping: false });
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

  console.log('Socket.io server initialized');
  return io;
};

/**
 * Handle room availability subscription
 */
const handleRoomSubscription = (socket, data) => {
  if (!data.roomId) {
    socket.emit('error', { message: 'Room ID required' });
    return;
  }

  const room = `room:${data.roomId}`;
  socket.join(room);
  console.log(`Socket ${socket.id} subscribed to room ${data.roomId}`);
  
  socket.emit('room:subscribed', { roomId: data.roomId });
};

/**
 * Handle room unsubscription
 */
const handleRoomUnsubscription = (socket, data) => {
  if (!data.roomId) return;

  const room = `room:${data.roomId}`;
  socket.leave(room);
  console.log(`Socket ${socket.id} unsubscribed from room ${data.roomId}`);
};

/**
 * Handle booking subscription
 */
const handleBookingSubscription = (socket, data) => {
  if (!data.bookingId) {
    socket.emit('error', { message: 'Booking ID required' });
    return;
  }

  const room = `booking:${data.bookingId}`;
  socket.join(room);
  console.log(`Socket ${socket.id} subscribed to booking ${data.bookingId}`);
  
  socket.emit('booking:subscribed', { bookingId: data.bookingId });
};

/**
 * Handle chat messages
 */
const handleChatMessage = async (socket, data) => {
  if (!data.room || !data.message) {
    socket.emit('error', { message: 'Room and message required' });
    return;
  }

  const messageData = {
    id: require('crypto').randomUUID(),
    room: data.room,
    from: socket.user.id,
    message: data.message,
    timestamp: new Date().toISOString()
  };

  // Broadcast to room
  io.to(data.room).emit('chat:message', messageData);
  
  // Store message in database if needed
  // await ChatMessage.create(messageData);
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
  emitToRoom(`booking:${bookingId}`, 'booking:update', update);
};

/**
 * Emit room availability update
 */
const emitRoomAvailability = (roomId, availability) => {
  emitToRoom(`room:${roomId}`, 'room:availability', availability);
};

/**
 * Emit notification to user
 */
const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification:new', notification);
};

/**
 * Emit real-time dashboard update
 */
const emitDashboardUpdate = (type, data) => {
  io.to('admin:dashboard').emit(`dashboard:${type}`, data);
};

/**
 * Namespace handlers for admin
 */
const setupAdminNamespace = (io) => {
  const adminNamespace = io.of(config.socket.namespace.admin);
  
  adminNamespace.use(async (socket, next) => {
    // Check admin role
    if (socket.user.role !== 'admin' && socket.user.role !== 'manager') {
      return next(new Error('Unauthorized'));
    }
    next();
  });

  adminNamespace.on('connection', (socket) => {
    console.log(`Admin socket connected: ${socket.id}`);
    
    // Join admin dashboard room
    socket.join('dashboard');
  });
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
  setupAdminNamespace
};
