const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Notification Service - Multi-channel notifications
 */
class NotificationService {
  /**
   * Create and send notification
   */
  async send(userId, notificationData) {
    const { type, title, message, data, priority, channels } = notificationData;

    // Create notification record
    const notification = await Notification.create({
      recipient: userId,
      type,
      title,
      message,
      data,
      priority: priority || 'medium',
      channels: {
        email: { sent: false },
        sms: { sent: false },
        push: { sent: false },
        inApp: { sent: true }
      }
    });

    // Get user preferences
    const user = await User.findById(userId);
    const preferences = user?.preferences?.notifications || {
      email: true,
      sms: true,
      push: true
    };

    // Send via enabled channels
    if (channels?.email !== false && preferences.email) {
      await this.sendEmail(user, notification);
    }

    if (channels?.sms !== false && preferences.sms) {
      await this.sendSMS(user, notification);
    }

    if (channels?.push !== false && preferences.push) {
      await this.sendPush(user, notification);
    }

    return notification;
  }

  /**
   * Send email notification
   */
  async sendEmail(user, notification) {
    try {
      const emailService = require('./email.service');
      await emailService.send({
        to: user.email,
        subject: notification.title?.en || notification.title,
        html: notification.message?.en || notification.message
      });

      notification.channels.email.sent = true;
      notification.channels.email.sentAt = new Date();
      await notification.save();
    } catch (error) {
      logger.error(`Email notification error: ${error.message}`);
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(user, notification) {
    try {
      const smsService = require('./sms.service');
      const phone = user.profile?.phone;
      if (phone) {
        await smsService.send(phone, notification.message?.en || notification.message);
        notification.channels.sms.sent = true;
        notification.channels.sms.sentAt = new Date();
        await notification.save();
      }
    } catch (error) {
      logger.error(`SMS notification error: ${error.message}`);
    }
  }

  /**
   * Send push notification
   */
  async sendPush(user, notification) {
    // Would integrate with FCM/APNs
    logger.info(`Push notification would be sent to user ${user._id}`);
    notification.channels.push.sent = true;
    notification.channels.push.sentAt = new Date();
    await notification.save();
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(userId, booking) {
    return this.send(userId, {
      type: 'booking',
      title: { en: 'Booking Confirmed' },
      message: { en: `Your booking ${booking.bookingReference} is confirmed!` },
      data: { bookingId: booking._id },
      channels: { email: true, sms: true }
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(userId, booking, payment) {
    return this.send(userId, {
      type: 'payment',
      title: { en: 'Payment Received' },
      message: { en: `Payment of $${payment.amount} received for ${booking.bookingReference}` },
      data: { bookingId: booking._id, paymentId: payment._id }
    });
  }

  /**
   * Send reminder notification
   */
  async sendReminder(userId, title, message, data) {
    return this.send(userId, {
      type: 'reminder',
      title,
      message,
      data,
      priority: 'high'
    });
  }

  /**
   * Send bulk notifications
   */
  async sendBulk(userIds, notificationData) {
    const notifications = await Notification.insertMany(
      userIds.map(userId => ({
        recipient: userId,
        ...notificationData,
        channels: {
          email: { sent: false },
          sms: { sent: false },
          push: { sent: false },
          inApp: { sent: true }
        }
      }))
    );

    return notifications;
  }

  /**
   * Schedule notification
   */
  async schedule(userId, notificationData, scheduledFor) {
    return this.send(userId, {
      ...notificationData,
      scheduledFor
    });
  }
}

module.exports = new NotificationService();
