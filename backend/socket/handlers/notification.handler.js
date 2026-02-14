/**
 * Notification Socket Handler
 * Handles real-time notification socket events
 */

const Notification = require('../../models/Notification');
const { emitToUser, emitToRoom, emitToAll } = require('../index');

/**
 * Handle notification subscription
 * Subscribe user to their personal notifications
 */
const handleNotificationSubscribe = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required for notifications' 
      });
      return;
    }

    // Join user's notification room
    socket.join(`notifications:${userId}`);
    
    console.log(`Socket ${socket.id} subscribed to notifications for user ${userId}`);
    
    // Get unread notification count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    // Send subscription confirmation
    socket.emit('notification:subscribed', { 
      userId,
      unreadCount
    });

  } catch (error) {
    console.error('Notification subscribe error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to subscribe to notifications' 
    });
  }
};

/**
 * Handle notification unsubscription
 */
const handleNotificationUnsubscribe = (socket, data) => {
  const userId = socket.user?.id;
  
  if (!userId) return;

  socket.leave(`notifications:${userId}`);
  
  console.log(`Socket ${socket.id} unsubscribed from notifications for user ${userId}`);
};

/**
 * Handle fetching user notifications
 */
const handleGetNotifications = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    const { limit = 20, offset = 0, unreadOnly = false } = data || {};
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required' 
      });
      return;
    }

    const query = { recipient: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    socket.emit('notification:list', {
      notifications,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to fetch notifications' 
    });
  }
};

/**
 * Handle marking notification as read
 */
const handleMarkAsRead = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    const { notificationId } = data;
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required' 
      });
      return;
    }

    if (!notificationId) {
      socket.emit('notification:error', { 
        message: 'Notification ID required' 
      });
      return;
    }

    // Update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      socket.emit('notification:error', { 
        message: 'Notification not found' 
      });
      return;
    }

    // Emit confirmation
    socket.emit('notification:read', { 
      notificationId,
      readAt: notification.readAt
    });

    // Update unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    socket.emit('notification:unread_count', { 
      count: unreadCount 
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to mark notification as read' 
    });
  }
};

/**
 * Handle marking all notifications as read
 */
const handleMarkAllAsRead = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required' 
      });
      return;
    }

    // Update all unread notifications
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    socket.emit('notification:all_read', { 
      modifiedCount: result.modifiedCount 
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to mark all notifications as read' 
    });
  }
};

/**
 * Handle deleting a notification
 */
const handleDeleteNotification = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    const { notificationId } = data;
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required' 
      });
      return;
    }

    if (!notificationId) {
      socket.emit('notification:error', { 
        message: 'Notification ID required' 
      });
      return;
    }

    // Delete notification
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!result) {
      socket.emit('notification:error', { 
        message: 'Notification not found' 
      });
      return;
    }

    socket.emit('notification:deleted', { 
      notificationId 
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to delete notification' 
    });
  }
};

/**
 * Handle admin broadcast notification
 */
const handleBroadcastNotification = async (socket, io, data) => {
  try {
    const { title, message, type = 'system', targetRoles, targetUsers } = data;
    
    // Verify admin/manager role
    if (!['admin', 'manager'].includes(socket.user?.role)) {
      socket.emit('error', { 
        message: 'Unauthorized to broadcast notifications' 
      });
      return;
    }

    if (!title || !message) {
      socket.emit('notification:error', { 
        message: 'Title and message are required' 
      });
      return;
    }

    // Create notification for each target user
    const notificationData = {
      title,
      message,
      type,
      sender: socket.user.id,
      createdAt: new Date()
    };

    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      const notifications = targetUsers.map(userId => ({
        ...notificationData,
        recipient: userId
      }));

      await Notification.insertMany(notifications);

      // Emit to each user
      for (const userId of targetUsers) {
        emitToUser(userId, 'notification:new', {
          ...notificationData,
          recipient: userId
        });
      }
    } else if (targetRoles && targetRoles.length > 0) {
      // Get all users with specified roles and send notifications
      const User = require('../../models/User');
      
      for (const role of targetRoles) {
        const users = await User.find({ role }).select('_id');
        
        const notifications = users.map(user => ({
          ...notificationData,
          recipient: user._id
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          
          // Emit to each user
          for (const user of users) {
            emitToUser(user._id.toString(), 'notification:new', {
              ...notificationData,
              recipient: user._id
            });
          }
        }
      }
    } else {
      // Broadcast to all connected users
      io.emit('notification:broadcast', notificationData);
    }

    socket.emit('notification:broadcast_success', { 
      title,
      targetUsers: targetUsers?.length || 'all',
      targetRoles
    });

  } catch (error) {
    console.error('Broadcast notification error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to broadcast notification' 
    });
  }
};

/**
 * Handle real-time alert for admin dashboard
 */
const handleAdminAlert = async (socket, io, data) => {
  try {
    const { alertType, title, message, data: alertData } = data;
    
    // Verify admin role
    if (!['admin', 'manager'].includes(socket.user?.role)) {
      socket.emit('error', { 
        message: 'Unauthorized' 
      });
      return;
    }

    const alert = {
      id: require('crypto').randomUUID(),
      type: alertType,
      title,
      message,
      data: alertData,
      timestamp: new Date().toISOString(),
      createdBy: socket.user.id
    };

    // Emit to admin dashboard
    io.to('admin:dashboard').emit('dashboard:alert', alert);

    // Also emit to specific admin users
    io.emit('admin:alert', alert);

    socket.emit('admin:alert_sent', { 
      alertId: alert.id 
    });

  } catch (error) {
    console.error('Admin alert error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to send alert' 
    });
  }
};

/**
 * Handle push notification subscription (for mobile/web push)
 */
const handlePushSubscription = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    const { subscription } = data;
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required' 
      });
      return;
    }

    if (!subscription || !subscription.endpoint) {
      socket.emit('notification:error', { 
        message: 'Push subscription is required' 
      });
      return;
    }

    // Store push subscription (would update User model in production)
    // For now, just acknowledge
    socket.emit('notification:push_subscribed', { 
      userId,
      endpoint: subscription.endpoint
    });

  } catch (error) {
    console.error('Push subscription error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to subscribe to push notifications' 
    });
  }
};

/**
 * Handle notification settings update
 */
const handleNotificationSettings = async (socket, data) => {
  try {
    const userId = socket.user?.id;
    const { settings } = data;
    
    if (!userId || socket.user.isGuest) {
      socket.emit('notification:error', { 
        message: 'Authentication required' 
      });
      return;
    }

    // Store notification settings (would update User model in production)
    // For now, just acknowledge
    socket.emit('notification:settings_updated', { 
      userId,
      settings
    });

  } catch (error) {
    console.error('Notification settings error:', error);
    socket.emit('notification:error', { 
      message: 'Failed to update notification settings' 
    });
  }
};

/**
 * Utility function to send notification to user
 */
const sendNotificationToUser = async (userId, notification) => {
  try {
    // Save to database
    const savedNotification = await Notification.create({
      recipient: userId,
      ...notification
    });

    // Emit via socket if user is connected
    emitToUser(userId, 'notification:new', savedNotification);

    return savedNotification;
  } catch (error) {
    console.error('Send notification error:', error);
    throw error;
  }
};

/**
 * Utility function to send notification to room
 */
const sendNotificationToRoom = async (room, notification) => {
  try {
    // Emit via socket
    emitToRoom(room, 'notification:room', notification);
  } catch (error) {
    console.error('Send room notification error:', error);
    throw error;
  }
};

/**
 * Register all notification event handlers
 */
const registerNotificationHandlers = (io, socket) => {
  socket.on('notification:subscribe', (data) => handleNotificationSubscribe(socket, data));
  socket.on('notification:unsubscribe', (data) => handleNotificationUnsubscribe(socket, data));
  socket.on('notification:get', (data) => handleGetNotifications(socket, data));
  socket.on('notification:read', (data) => handleMarkAsRead(socket, data));
  socket.on('notification:read_all', (data) => handleMarkAllAsRead(socket, data));
  socket.on('notification:delete', (data) => handleDeleteNotification(socket, data));
  socket.on('notification:broadcast', (data) => handleBroadcastNotification(socket, io, data));
  socket.on('admin:alert', (data) => handleAdminAlert(socket, io, data));
  socket.on('notification:push_subscribe', (data) => handlePushSubscription(socket, data));
  socket.on('notification:settings', (data) => handleNotificationSettings(socket, data));
};

module.exports = {
  registerNotificationHandlers,
  handleNotificationSubscribe,
  handleNotificationUnsubscribe,
  handleGetNotifications,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleDeleteNotification,
  handleBroadcastNotification,
  handleAdminAlert,
  sendNotificationToUser,
  sendNotificationToRoom
};
