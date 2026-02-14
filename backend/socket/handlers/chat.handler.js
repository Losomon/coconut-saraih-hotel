/**
 * Chat Socket Handler
 * Handles real-time chat messaging socket events
 */

// In-memory chat storage (would be database in production)
const activeChats = new Map();
const chatRooms = new Map();

/**
 * Handle joining a chat room
 */
const handleJoinChat = (socket, io, data) => {
  try {
    const { roomId, roomName } = data;
    
    if (!roomId) {
      socket.emit('chat:error', { 
        message: 'Room ID is required' 
      });
      return;
    }

    // Join the room
    const room = `chat:${roomId}`;
    socket.join(room);
    
    // Track active users in room
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Set());
    }
    chatRooms.get(roomId).add(socket.id);

    // Create or get chat history
    if (!activeChats.has(roomId)) {
      activeChats.set(roomId, {
        id: roomId,
        name: roomName || `Chat Room ${roomId}`,
        messages: [],
        participants: new Set(),
        createdAt: new Date().toISOString()
      });
    }
    
    const chat = activeChats.get(roomId);
    chat.participants.add(socket.user?.id || socket.id);

    // Get recent messages (last 50)
    const recentMessages = chat.messages.slice(-50);

    console.log(`Socket ${socket.id} joined chat room ${roomId}`);
    
    // Send chat history to user
    socket.emit('chat:joined', {
      roomId,
      roomName: chat.name,
      messages: recentMessages,
      participantCount: chat.participants.size
    });

    // Notify others in room
    socket.to(room).emit('chat:user_joined', {
      userId: socket.user?.id || 'guest',
      socketId: socket.id,
      userName: socket.user?.firstName || 'Guest',
      participantCount: chat.participants.size,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Join chat error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to join chat room' 
    });
  }
};

/**
 * Handle leaving a chat room
 */
const handleLeaveChat = (socket, io, data) => {
  try {
    const { roomId } = data;
    
    if (!roomId) return;

    const room = `chat:${roomId}`;
    socket.leave(room);

    // Update participant count
    if (chatRooms.has(roomId)) {
      const roomParticipants = chatRooms.get(roomId);
      roomParticipants.delete(socket.id);
      
      // Notify others
      socket.to(room).emit('chat:user_left', {
        userId: socket.user?.id || 'guest',
        socketId: socket.id,
        participantCount: roomParticipants.size,
        timestamp: new Date().toISOString()
      });

      // Clean up empty rooms
      if (roomParticipants.size === 0) {
        chatRooms.delete(roomId);
      }
    }

    console.log(`Socket ${socket.id} left chat room ${roomId}`);

  } catch (error) {
    console.error('Leave chat error:', error);
  }
};

/**
 * Handle sending a chat message
 */
const handleChatMessage = (socket, io, data) => {
  try {
    const { roomId, message, messageType = 'text', metadata } = data;
    
    if (!roomId || !message) {
      socket.emit('chat:error', { 
        message: 'Room ID and message are required' 
      });
      return;
    }

    // Get or create chat room
    if (!activeChats.has(roomId)) {
      socket.emit('chat:error', { 
        message: 'Chat room does not exist' 
      });
      return;
    }

    const chat = activeChats.get(roomId);
    const messageId = require('crypto').randomUUID();

    // Create message object
    const chatMessage = {
      id: messageId,
      roomId,
      message: message.substring(0, 5000), // Limit message length
      messageType,
      sender: {
        id: socket.user?.id || 'guest',
        name: socket.user?.firstName 
          ? `${socket.user.firstName} ${socket.user.lastName || ''}`.trim()
          : 'Guest',
        role: socket.user?.role || 'guest'
      },
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      reactions: []
    };

    // Store message
    chat.messages.push(chatMessage);

    // Keep only last 500 messages in memory
    if (chat.messages.length > 500) {
      chat.messages = chat.messages.slice(-500);
    }

    // Broadcast message to room
    io.to(`chat:${roomId}`).emit('chat:message', chatMessage);

    // Store message in database (would be async in production)
    // storeMessageInDatabase(chatMessage);

    console.log(`Message sent in room ${roomId} by ${socket.user?.id || 'guest'}`);

  } catch (error) {
    console.error('Chat message error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to send message' 
    });
  }
};

/**
 * Handle typing indicator
 */
const handleTypingStart = (socket, io, data) => {
  try {
    const { roomId } = data;
    
    if (!roomId) return;

    // Broadcast typing indicator to room (excluding sender)
    socket.to(`chat:${roomId}`).emit('chat:typing', {
      roomId,
      userId: socket.user?.id || 'guest',
      userName: socket.user?.firstName || 'Guest',
      isTyping: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Typing start error:', error);
  }
};

/**
 * Handle typing stop
 */
const handleTypingStop = (socket, io, data) => {
  try {
    const { roomId } = data;
    
    if (!roomId) return;

    socket.to(`chat:${roomId}`).emit('chat:typing', {
      roomId,
      userId: socket.user?.id || 'guest',
      userName: socket.user?.firstName || 'Guest',
      isTyping: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Typing stop error:', error);
  }
};

/**
 * Handle message reaction (emoji)
 */
const handleMessageReaction = (socket, io, data) => {
  try {
    const { roomId, messageId, reaction, emoji } = data;
    
    if (!roomId || !messageId || !emoji) {
      socket.emit('chat:error', { 
        message: 'Room ID, message ID, and emoji are required' 
      });
      return;
    }

    if (!activeChats.has(roomId)) {
      return;
    }

    const chat = activeChats.get(roomId);
    const message = chat.messages.find(m => m.id === messageId);
    
    if (!message) {
      socket.emit('chat:error', { 
        message: 'Message not found' 
      });
      return;
    }

    const userId = socket.user?.id || 'guest';
    const existingReaction = message.reactions.find(
      r => r.emoji === emoji && r.userId === userId
    );

    if (existingReaction) {
      // Remove reaction if already exists
      message.reactions = message.reactions.filter(
        r => !(r.emoji === emoji && r.userId === userId)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        userId,
        userName: socket.user?.firstName || 'Guest',
        createdAt: new Date().toISOString()
      });
    }

    // Broadcast reaction update
    io.to(`chat:${roomId}`).emit('chat:reaction', {
      roomId,
      messageId,
      emoji,
      reactions: message.reactions,
      action: existingReaction ? 'removed' : 'added',
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Message reaction error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to add reaction' 
    });
  }
};

/**
 * Handle direct message (DM)
 */
const handleDirectMessage = (socket, io, data) => {
  try {
    const { recipientId, message, messageType = 'text' } = data;
    
    if (!recipientId || !message) {
      socket.emit('chat:error', { 
        message: 'Recipient ID and message are required' 
      });
      return;
    }

    const senderId = socket.user?.id;
    if (!senderId) {
      socket.emit('chat:error', { 
        message: 'Authentication required for direct messages' 
      });
      return;
    }

    // Create DM room ID (sorted user IDs to ensure consistency)
    const dmRoomId = [senderId, recipientId].sort().join('_dm_');

    const messageId = require('crypto').randomUUID();
    const dmMessage = {
      id: messageId,
      roomId: dmRoomId,
      isDirect: true,
      message: message.substring(0, 5000),
      messageType,
      sender: {
        id: senderId,
        name: socket.user?.firstName 
          ? `${socket.user.firstName} ${socket.user.lastName || ''}`.trim()
          : 'Guest',
        role: socket.user?.role || 'guest'
      },
      recipient: {
        id: recipientId
      },
      timestamp: new Date().toISOString(),
      read: false
    };

    // Send to recipient
    io.to(`user:${recipientId}`).emit('chat:direct_message', dmMessage);
    
    // Send confirmation to sender
    socket.emit('chat:dm_sent', {
      messageId,
      recipientId,
      timestamp: dmMessage.timestamp
    });

    console.log(`DM sent from ${senderId} to ${recipientId}`);

  } catch (error) {
    console.error('Direct message error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to send direct message' 
    });
  }
};

/**
 * Handle message read receipt
 */
const handleMessageRead = (socket, io, data) => {
  try {
    const { roomId, messageIds, userId } = data;
    
    if (!roomId || !messageIds || !Array.isArray(messageIds)) {
      return;
    }

    const readerId = socket.user?.id;
    
    // Broadcast read receipt to room
    socket.to(`chat:${roomId}`).emit('chat:read_receipt', {
      roomId,
      messageIds,
      readBy: readerId || 'guest',
      readAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Message read error:', error);
  }
};

/**
 * Handle creating a new chat room
 */
const handleCreateChatRoom = (socket, io, data) => {
  try {
    const { name, description, isPrivate = false, inviteUsers = [] } = data;
    
    if (!name) {
      socket.emit('chat:error', { 
        message: 'Room name is required' 
      });
      return;
    }

    // Check permissions (admin, manager, or staff can create rooms)
    if (!['admin', 'manager', 'staff'].includes(socket.user?.role)) {
      socket.emit('chat:error', { 
        message: 'Unauthorized to create chat rooms' 
      });
      return;
    }

    const roomId = require('crypto').randomUUID();
    const room = {
      id: roomId,
      name,
      description: description || '',
      isPrivate,
      createdBy: socket.user.id,
      createdAt: new Date().toISOString(),
      messages: [],
      participants: new Set(),
      settings: {
        allowGuest: false,
        maxParticipants: 100,
        requireApproval: isPrivate
      }
    };

    activeChats.set(roomId, room);

    // Invite users if specified
    if (inviteUsers.length > 0) {
      for (const userId of inviteUsers) {
        io.to(`user:${userId}`).emit('chat:room_invite', {
          roomId,
          roomName: name,
          invitedBy: socket.user.id,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Send room created confirmation
    socket.emit('chat:room_created', {
      roomId,
      name,
      createdAt: room.createdAt
    });

    // Notify admins
    io.to('admin:dashboard').emit('dashboard:chat_room_created', {
      roomId,
      roomName: name,
      createdBy: socket.user.id,
      timestamp: new Date().toISOString()
    });

    console.log(`Chat room created: ${name} (${roomId}) by ${socket.user.id}`);

  } catch (error) {
    console.error('Create chat room error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to create chat room' 
    });
  }
};

/**
 * Handle deleting a message (admin)
 */
const handleDeleteMessage = (socket, io, data) => {
  try {
    const { roomId, messageId, reason } = data;
    
    if (!roomId || !messageId) {
      socket.emit('chat:error', { 
        message: 'Room ID and message ID are required' 
      });
      return;
    }

    // Check admin permissions
    if (!['admin', 'manager'].includes(socket.user?.role)) {
      socket.emit('chat:error', { 
        message: 'Unauthorized to delete messages' 
      });
      return;
    }

    if (!activeChats.has(roomId)) {
      socket.emit('chat:error', { 
        message: 'Chat room not found' 
      });
      return;
    }

    const chat = activeChats.get(roomId);
    const messageIndex = chat.messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      socket.emit('chat:error', { 
        message: 'Message not found' 
      });
      return;
    }

    // Store deleted message info before removing
    const deletedMessage = chat.messages[messageIndex];
    
    // Remove message
    chat.messages.splice(messageIndex, 1);

    // Broadcast deletion
    io.to(`chat:${roomId}`).emit('chat:message_deleted', {
      roomId,
      messageId,
      deletedBy: socket.user.id,
      reason: reason || 'Removed by moderator',
      originalSender: deletedMessage.sender.id,
      timestamp: new Date().toISOString()
    });

    console.log(`Message ${messageId} deleted from room ${roomId}`);

  } catch (error) {
    console.error('Delete message error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to delete message' 
    });
  }
};

/**
 * Handle getting chat room info
 */
const handleGetChatRoomInfo = (socket, data) => {
  try {
    const { roomId } = data;
    
    if (!roomId) {
      socket.emit('chat:error', { 
        message: 'Room ID is required' 
      });
      return;
    }

    if (!activeChats.has(roomId)) {
      socket.emit('chat:error', { 
        message: 'Chat room not found' 
      });
      return;
    }

    const chat = activeChats.get(roomId);
    
    socket.emit('chat:room_info', {
      roomId: chat.id,
      name: chat.name,
      description: chat.description,
      createdAt: chat.createdAt,
      participantCount: chat.participants.size,
      messageCount: chat.messages.length,
      isPrivate: chat.isPrivate,
      createdBy: chat.createdBy
    });

  } catch (error) {
    console.error('Get chat room info error:', error);
    socket.emit('chat:error', { 
      message: 'Failed to get room info' 
    });
  }
};

/**
 * Handle getting online users in a room
 */
const handleGetOnlineUsers = (socket, data) => {
  try {
    const { roomId } = data;
    
    if (!roomId || !chatRooms.has(roomId)) {
      socket.emit('chat:online_users', {
        roomId,
        users: []
      });
      return;
    }

    const roomParticipants = chatRooms.get(roomId);
    
    socket.emit('chat:online_users', {
      roomId,
      users: Array.from(roomParticipants)
    });

  } catch (error) {
    console.error('Get online users error:', error);
  }
};

/**
 * Register all chat event handlers
 */
const registerChatHandlers = (io, socket) => {
  socket.on('chat:join', (data) => handleJoinChat(socket, io, data));
  socket.on('chat:leave', (data) => handleLeaveChat(socket, io, data));
  socket.on('chat:message', (data) => handleChatMessage(socket, io, data));
  socket.on('chat:typing_start', (data) => handleTypingStart(socket, io, data));
  socket.on('chat:typing_stop', (data) => handleTypingStop(socket, io, data));
  socket.on('chat:reaction', (data) => handleMessageReaction(socket, io, data));
  socket.on('chat:dm', (data) => handleDirectMessage(socket, io, data));
  socket.on('chat:read', (data) => handleMessageRead(socket, io, data));
  socket.on('chat:create_room', (data) => handleCreateChatRoom(socket, io, data));
  socket.on('chat:delete_message', (data) => handleDeleteMessage(socket, io, data));
  socket.on('chat:room_info', (data) => handleGetChatRoomInfo(socket, data));
  socket.on('chat:get_online', (data) => handleGetOnlineUsers(socket, data));
};

module.exports = {
  registerChatHandlers,
  handleJoinChat,
  handleLeaveChat,
  handleChatMessage,
  handleTypingStart,
  handleTypingStop,
  handleMessageReaction,
  handleDirectMessage,
  handleMessageRead,
  handleCreateChatRoom,
  handleDeleteMessage,
  handleGetChatRoomInfo,
  handleGetOnlineUsers,
  activeChats,
  chatRooms
};
