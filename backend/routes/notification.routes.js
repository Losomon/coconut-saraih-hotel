const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, notificationController.getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, notificationController.getUnreadCount);

// @route   GET /api/notifications/:id
// @desc    Get single notification
// @access  Private
router.get('/:id', protect, notificationController.getNotification);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', protect, notificationController.markAsRead);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', protect, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, notificationController.deleteNotification);

// @route   DELETE /api/notifications
// @desc    Delete all read notifications
// @access  Private
router.delete('/', protect, notificationController.deleteReadNotifications);

// @route   POST /api/notifications
// @desc    Create notification (admin/system)
// @access  Private (Admin)
router.post('/', protect, notificationController.createNotification);

// @route   POST /api/notifications/bulk
// @desc    Send bulk notifications
// @access  Private (Admin)
router.post('/bulk', protect, notificationController.sendBulkNotification);

// @route   POST /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.post('/preferences', protect, notificationController.updatePreferences);

// @route   POST /api/notifications/system
// @desc    Send system notification to all users
// @access  Private (Admin)
router.post('/system', protect, notificationController.sendSystemNotification);

module.exports = router;
