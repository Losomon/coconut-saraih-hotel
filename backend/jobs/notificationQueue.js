/**
 * Notification Queue
 * Bull queue for processing push notification jobs
 */

const Queue = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

// Create notification queue
const notificationQueue = new Queue('notification-queue', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db || 0
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: 200,
    removeOnFail: 500
  }
});

// Notification job types
const NOTIFICATION_JOB_TYPES = {
  PUSH_NOTIFICATION: 'push_notification',
  IN_APP_NOTIFICATION: 'in_app_notification',
  BOOKING_ALERT: 'booking_alert',
  PAYMENT_ALERT: 'payment_alert',
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
  SYSTEM_ALERT: 'system_alert',
  BULK_NOTIFICATION: 'bulk_notification'
};

/**
 * Process notification jobs
 */
notificationQueue.process(async (job) => {
  const { type, data, userId, users, notification } = job.data;

  logger.info(`Processing notification job: ${job.id}, type: ${type}`);

  try {
    switch (type) {
      case NOTIFICATION_JOB_TYPES.PUSH_NOTIFICATION:
        await sendPushNotification(notification);
        break;

      case NOTIFICATION_JOB_TYPES.IN_APP_NOTIFICATION:
        await sendInAppNotification(userId, notification);
        break;

      case NOTIFICATION_JOB_TYPES.BOOKING_ALERT:
        await sendBookingAlert(userId, data);
        break;

      case NOTIFICATION_JOB_TYPES.PAYMENT_ALERT:
        await sendPaymentAlert(userId, data);
        break;

      case NOTIFICATION_JOB_TYPES.REMINDER:
        await sendReminder(userId, data);
        break;

      case NOTIFICATION_JOB_TYPES.PROMOTION:
        await sendPromotion(userId, data);
        break;

      case NOTIFICATION_JOB_TYPES.SYSTEM_ALERT:
        await sendSystemAlert(data);
        break;

      case NOTIFICATION_JOB_TYPES.BULK_NOTIFICATION:
        await sendBulkNotification(users, notification);
        break;

      default:
        logger.warn(`Unknown notification job type: ${type}`);
        throw new Error(`Unknown notification job type: ${type}`);
    }

    logger.info(`Notification job completed: ${job.id}`);
    return { success: true };

  } catch (error) {
    logger.error(`Notification job failed: ${job.id}`, error);
    throw error;
  }
});

/**
 * Send push notification (placeholder - integrate with FCM/APNs)
 */
const sendPushNotification = async (notification) => {
  // This would integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs)
  // For now, just log the notification
  
  logger.info('Sending push notification:', {
    title: notification.title,
    body: notification.body,
    data: notification.data
  });

  // Example FCM integration:
  // const admin = require('firebase-admin');
  // await admin.messaging().send({
  //   notification: {
  //     title: notification.title,
  //     body: notification.body
  //   },
  //   data: notification.data || {},
  //   token: notification.token
  // });

  return { sent: true };
};

/**
 * Send in-app notification
 */
const sendInAppNotification = async (userId, notification) => {
  const Notification = require('../models/Notification');
  
  // Save to database
  const savedNotification = await Notification.create({
    recipient: userId,
    title: notification.title,
    message: notification.body,
    type: notification.type || 'general',
    data: notification.data,
    read: false,
    createdAt: new Date()
  });

  // Emit via socket if user is connected
  const { emitToUser } = require('../socket');
  emitToUser(userId, 'notification:new', savedNotification);

  return savedNotification;
};

/**
 * Send booking alert notification
 */
const sendBookingAlert = async (userId, data) => {
  const { bookingReference, status, message } = data;

  const notification = {
    title: `Booking ${status}`,
    body: message || `Your booking ${bookingReference} has been ${status}`,
    type: 'booking',
    data: {
      bookingReference,
      status
    }
  };

  // Send both push and in-app
  if (data.sendPush) {
    await sendPushNotification({ ...notification, token: data.pushToken });
  }

  return sendInAppNotification(userId, notification);
};

/**
 * Send payment alert notification
 */
const sendPaymentAlert = async (userId, data) => {
  const { bookingReference, amount, status, message } = data;

  const notification = {
    title: `Payment ${status}`,
    body: message || `Payment of ${amount} for ${bookingReference} is ${status}`,
    type: 'payment',
    data: {
      bookingReference,
      amount,
      status
    }
  };

  if (data.sendPush) {
    await sendPushNotification({ ...notification, token: data.pushToken });
  }

  return sendInAppNotification(userId, notification);
};

/**
 * Send reminder notification
 */
const sendReminder = async (userId, data) => {
  const { title, message, actionUrl, type } = data;

  const notification = {
    title: title || 'Reminder',
    body: message,
    type: type || 'reminder',
    data: {
      actionUrl,
      type: 'reminder'
    }
  };

  if (data.sendPush) {
    await sendPushNotification({ ...notification, token: data.pushToken });
  }

  return sendInAppNotification(userId, notification);
};

/**
 * Send promotion notification
 */
const sendPromotion = async (userId, data) => {
  const { title, message, offerCode, discount, validUntil, actionUrl } = data;

  const notification = {
    title: title || 'Special Offer!',
    body: message || `Get ${discount}% off! Use code: ${offerCode}`,
    type: 'promotion',
    data: {
      offerCode,
      discount,
      validUntil,
      actionUrl,
      type: 'promotion'
    }
  };

  if (data.sendPush) {
    await sendPushNotification({ ...notification, token: data.pushToken });
  }

  return sendInAppNotification(userId, notification);
};

/**
 * Send system alert
 */
const sendSystemAlert = async (data) => {
  const { title, message, severity, targetRoles } = data;

  const User = require('../models/User');
  
  // Get users by role if specified
  let users = [];
  if (targetRoles && targetRoles.length > 0) {
    users = await User.find({ role: { $in: targetRoles } }).select('_id');
  }

  const notification = {
    title: title || 'System Alert',
    body: message,
    type: 'system',
    data: {
      severity,
      type: 'system'
    }
  };

  // Send to all specified users
  const results = [];
  for (const user of users) {
    const result = await sendInAppNotification(user._id.toString(), notification);
    results.push(result);
  }

  return results;
};

/**
 * Send bulk notification
 */
const sendBulkNotification = async (users, notification) => {
  const results = [];
  
  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    
    const batchPromises = batch.map(userId => 
      sendInAppNotification(userId, notification).catch(err => {
        logger.error(`Failed to send notification to ${userId}:`, err);
        return null;
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(r => r !== null));
    
    // Small delay between batches
    if (i + batchSize < users.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { sent: results.length, failed: users.length - results.length };
};

/**
 * Add notification job to queue
 */
const addNotificationJob = async (type, data, options = {}) => {
  const job = await notificationQueue.add(
    { type, data },
    {
      priority: options.priority || 2,
      delay: options.delay || 0,
      ...options
    }
  );

  logger.info(`Notification job added: ${job.id}, type: ${type}`);
  return job;
};

/**
 * Schedule push notification
 */
const schedulePushNotification = async (userId, notification, scheduleTime) => {
  const delay = new Date(scheduleTime).getTime() - Date.now();
  
  if (delay <= 0) {
    return sendPushNotification({ ...notification, userId });
  }

  return addNotificationJob(
    NOTIFICATION_JOB_TYPES.PUSH_NOTIFICATION,
    { userId, notification },
    { delay }
  );
};

/**
 * Schedule booking status alert
 */
const scheduleBookingAlert = async (userId, bookingData, options = {}) => {
  return addNotificationJob(
    NOTIFICATION_JOB_TYPES.BOOKING_ALERT,
    { userId, data: bookingData, ...options }
  );
};

/**
 * Schedule payment alert
 */
const schedulePaymentAlert = async (userId, paymentData, options = {}) => {
  return addNotificationJob(
    NOTIFICATION_JOB_TYPES.PAYMENT_ALERT,
    { userId, data: paymentData, ...options }
  );
};

/**
 * Schedule reminder notification
 */
const scheduleReminder = async (userId, reminderData, scheduleTime) => {
  const delay = new Date(scheduleTime).getTime() - Date.now();
  
  if (delay <= 0) {
    return sendReminder(userId, reminderData);
  }

  return addNotificationJob(
    NOTIFICATION_JOB_TYPES.REMINDER,
    { userId, data: reminderData },
    { delay }
  );
};

/**
 * Schedule promotion notification
 */
const schedulePromotion = async (userId, promotionData, scheduleTime) => {
  const delay = new Date(scheduleTime).getTime() - Date.now();
  
  if (delay <= 0) {
    return sendPromotion(userId, promotionData);
  }

  return addNotificationJob(
    NOTIFICATION_JOB_TYPES.PROMOTION,
    { userId, data: promotionData },
    { delay }
  );
};

/**
 * Send system-wide alert
 */
const sendSystemWideAlert = async (alertData, targetRoles) => {
  return addNotificationJob(
    NOTIFICATION_JOB_TYPES.SYSTEM_ALERT,
    { data: { ...alertData, targetRoles } }
  );
};

/**
 * Schedule bulk notification
 */
const scheduleBulkNotification = async (userIds, notification) => {
  // Process in batches to avoid overwhelming the queue
  const batchSize = 100;
  const jobs = [];
  
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    
    const job = await notificationQueue.add({
      type: NOTIFICATION_JOB_TYPES.BULK_NOTIFICATION,
      users: batch,
      notification
    });
    
    jobs.push(job);
  }

  return jobs;
};

/**
 * Get notification queue stats
 */
const getNotificationQueueStats = async () => {
  const [
    waiting,
    active,
    completed,
    failed,
    delayed
  ] = await Promise.all([
    notificationQueue.getWaitingCount(),
    notificationQueue.getActiveCount(),
    notificationQueue.getCompletedCount(),
    notificationQueue.getFailedCount(),
    notificationQueue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed
  };
};

/**
 * Clear old notifications from database
 */
const clearOldNotifications = async (daysOld = 30) => {
  const Notification = require('../models/Notification');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    read: true,
    createdAt: { $lt: cutoffDate }
  });

  logger.info(`Cleared ${result.deletedCount} old notifications`);
  return result;
};

/**
 * Notification job event handlers
 */
notificationQueue.on('completed', (job, result) => {
  logger.debug(`Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, error) => {
  logger.error(`Notification job ${job.id} failed:`, error.message);
});

notificationQueue.on('error', (error) => {
  logger.error('Notification queue error:', error);
});

module.exports = {
  notificationQueue,
  NOTIFICATION_JOB_TYPES,
  addNotificationJob,
  sendPushNotification,
  sendInAppNotification,
  sendBookingAlert,
  sendPaymentAlert,
  sendReminder,
  sendPromotion,
  sendSystemAlert,
  sendBulkNotification,
  schedulePushNotification,
  scheduleBookingAlert,
  schedulePaymentAlert,
  scheduleReminder,
  schedulePromotion,
  sendSystemWideAlert,
  scheduleBulkNotification,
  getNotificationQueueStats,
  clearOldNotifications
};
