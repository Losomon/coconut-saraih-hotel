const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');

// @route   GET /api/v1/notifications
// @desc    Get user notifications
// @access  Private
exports.getNotifications = catchAsync(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;
  
  let query = { recipient: req.user._id };
  if (unreadOnly === 'true') {
    query['channels.inApp.read'] = false;
  }

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    'channels.inApp.read': false
  });

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.success(res, {
    notifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @route   GET /api/v1/notifications/:id
// @desc    Get single notification
// @access  Private
exports.getNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  ApiResponse.success(res, { notification });
});

// @route   PATCH /api/v1/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipient: req.user._id
    },
    {
      'channels.inApp.read': true,
      'channels.inApp.readAt': new Date()
    },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  ApiResponse.success(res, { notification }, 'Notification marked as read');
});

// @route   PATCH /api/v1/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      'channels.inApp.read': false
    },
    {
      'channels.inApp.read': true,
      'channels.inApp.readAt': new Date()
    }
  );

  ApiResponse.success(res, null, 'All notifications marked as read');
});

// @route   DELETE /api/v1/notifications/:id
// @desc    Delete notification
// @access  Private
exports.deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  ApiResponse.success(res, null, 'Notification deleted');
});

// @route   DELETE /api/v1/notifications
// @desc    Delete all read notifications
// @access  Private
exports.deleteReadNotifications = catchAsync(async (req, res) => {
  const result = await Notification.deleteMany({
    recipient: req.user._id,
    'channels.inApp.read': true
  });

  ApiResponse.success(res, { deleted: result.deletedCount }, 'Read notifications deleted');
});

// @route   POST /api/v1/notifications
// @desc    Create notification (admin/system)
// @access  Private (Admin)
exports.createNotification = catchAsync(async (req, res) => {
  const { recipientId, type, title, message, data, priority, scheduledFor } = req.body;

  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    data,
    priority,
    scheduledFor
  });

  // TODO: Send notification via appropriate channel
  // await notificationService.send(notification);

  ApiResponse.created(res, { notification }, 'Notification created');
});

// @route   POST /api/v1/notifications/bulk
// @desc    Send bulk notifications
// @access  Private (Admin)
exports.sendBulkNotification = catchAsync(async (req, res) => {
  const { userIds, type, title, message, data, priority } = req.body;

  const notifications = await Notification.insertMany(
    userIds.map(userId => ({
      recipient: userId,
      type,
      title,
      message,
      data,
      priority
    }))
  );

  ApiResponse.created(res, { count: notifications.length }, 'Bulk notifications sent');
});

// @route   POST /api/v1/notifications/preferences
// @desc    Update notification preferences
// @access  Private
exports.updatePreferences = catchAsync(async (req, res) => {
  const { email, sms, push } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      'preferences.notifications': {
        email: email ?? true,
        sms: sms ?? true,
        push: push ?? true
      }
    },
    { new: true }
  );

  ApiResponse.success(res, { preferences: user.preferences.notifications }, 'Preferences updated');
});

// @route   GET /api/v1/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    'channels.inApp.read': false
  });

  ApiResponse.success(res, { unreadCount: count });
});

// @route   POST /api/v1/notifications/system
// @desc    Send system notification to all users
// @access  Private (Admin)
exports.sendSystemNotification = catchAsync(async (req, res) => {
  const { title, message, priority = 'medium' } = req.body;

  // Get all active users
  const users = await User.find({ isActive: true }).select('_id');

  const notifications = await Notification.insertMany(
    users.map(user => ({
      recipient: user._id,
      type: 'system',
      title,
      message,
      priority
    }))
  );

  ApiResponse.created(res, { count: notifications.length }, 'System notification sent to all users');
});
