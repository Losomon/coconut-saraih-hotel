/**
 * Email Queue
 * Bull queue for processing email jobs
 */

const Queue = require('bull');
const config = require('../config');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Create email queue
const emailQueue = new Queue('email-queue', {
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
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 200
  }
});

// Email job types
const EMAIL_JOB_TYPES = {
  WELCOME: 'welcome',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_CANCELLATION: 'booking_cancellation',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  CHECKIN_REMINDER: 'checkin_reminder',
  CHECKOUT_REMINDER: 'checkout_reminder',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  INVOICE: 'invoice',
  CONTACT_CONFIRMATION: 'contact_confirmation',
  ACTIVITY_CONFIRMATION: 'activity_confirmation',
  RESTAURANT_RESERVATION: 'restaurant_reservation',
  FEEDBACK_REQUEST: 'feedback_request',
  NEWSLETTER: 'newsletter',
  CUSTOM: 'custom'
};

/**
 * Process email jobs
 */
emailQueue.process(async (job) => {
  const { type, data, to, subject, html } = job.data;

  logger.info(`Processing email job: ${job.id}, type: ${type}`);

  try {
    switch (type) {
      case EMAIL_JOB_TYPES.WELCOME:
        await emailService.sendEmail({
          to: data.user.email,
          ...emailService.templates.sendWelcomeEmail(data.user)
        });
        break;

      case EMAIL_JOB_TYPES.BOOKING_CONFIRMATION:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendBookingConfirmationEmail(data.booking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.BOOKING_CANCELLATION:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendBookingCancellationEmail(data.booking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.PAYMENT_CONFIRMATION:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendPaymentConfirmationEmail(data.payment, data.booking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.CHECKIN_REMINDER:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendCheckInReminderEmail(data.booking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.PASSWORD_RESET:
        await emailService.sendEmail({
          to: data.user.email,
          ...emailService.templates.sendPasswordResetEmail(data.user, data.resetToken)
        });
        break;

      case EMAIL_JOB_TYPES.EMAIL_VERIFICATION:
        await emailService.sendEmail({
          to: data.user.email,
          ...emailService.templates.sendVerificationEmail(data.user, data.verificationToken)
        });
        break;

      case EMAIL_JOB_TYPES.INVOICE:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendInvoiceEmail(data.invoice, data.booking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.CONTACT_CONFIRMATION:
        await emailService.sendEmail({
          to: data.contact.email,
          ...emailService.templates.sendContactConfirmationEmail(data.contact)
        });
        break;

      case EMAIL_JOB_TYPES.ACTIVITY_CONFIRMATION:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendActivityConfirmationEmail(data.activityBooking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.RESTAURANT_RESERVATION:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendRestaurantReservationEmail(data.reservation, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.FEEDBACK_REQUEST:
        await emailService.sendEmail({
          to: data.guest.email,
          ...emailService.templates.sendFeedbackRequestEmail(data.booking, data.guest)
        });
        break;

      case EMAIL_JOB_TYPES.NEWSLETTER:
        await emailService.sendEmail({
          to: data.email,
          ...emailService.templates.sendNewsletterSubscriptionEmail(data.email)
        });
        break;

      case EMAIL_JOB_TYPES.CUSTOM:
        await emailService.sendEmail({
          to,
          subject,
          html
        });
        break;

      default:
        logger.warn(`Unknown email job type: ${type}`);
        throw new Error(`Unknown email job type: ${type}`);
    }

    logger.info(`Email job completed: ${job.id}`);
    return { success: true };

  } catch (error) {
    logger.error(`Email job failed: ${job.id}`, error);
    throw error;
  }
});

/**
 * Email job event handlers
 */
emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, error) => {
  logger.error(`Email job ${job.id} failed:`, error.message);
});

emailQueue.on('error', (error) => {
  logger.error('Email queue error:', error);
});

emailQueue.on('waiting', (jobId) => {
  logger.debug(`Email job ${jobId} waiting`);
});

emailQueue.on('active', (job) => {
  logger.debug(`Email job ${job.id} started processing`);
});

/**
 * Add email job to queue
 */
const addEmailJob = async (type, data, options = {}) => {
  const job = await emailQueue.add(
    { type, data },
    {
      priority: options.priority || 2,
      delay: options.delay || 0,
      ...options
    }
  );

  logger.info(`Email job added: ${job.id}, type: ${type}`);
  return job;
};

/**
 * Schedule welcome email
 */
const scheduleWelcomeEmail = async (user) => {
  return addEmailJob(EMAIL_JOB_TYPES.WELCOME, { user }, { priority: 1 });
};

/**
 * Schedule booking confirmation email
 */
const scheduleBookingConfirmationEmail = async (booking, guest) => {
  return addEmailJob(EMAIL_JOB_TYPES.BOOKING_CONFIRMATION, { booking, guest }, { priority: 1 });
};

/**
 * Schedule booking cancellation email
 */
const scheduleBookingCancellationEmail = async (booking, guest) => {
  return addEmailJob(EMAIL_JOB_TYPES.BOOKING_CANCELLATION, { booking, guest }, { priority: 1 });
};

/**
 * Schedule payment confirmation email
 */
const schedulePaymentConfirmationEmail = async (payment, booking, guest) => {
  return addEmailJob(EMAIL_JOB_TYPES.PAYMENT_CONFIRMATION, { payment, booking, guest }, { priority: 1 });
};

/**
 * Schedule check-in reminder email
 */
const scheduleCheckInReminderEmail = async (booking, guest) => {
  // Schedule 1 day before check-in
  const checkInDate = new Date(booking.checkIn);
  const reminderDate = new Date(checkInDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0); // 9 AM

  const delay = reminderDate.getTime() - Date.now();
  
  if (delay > 0) {
    return addEmailJob(EMAIL_JOB_TYPES.CHECKIN_REMINDER, { booking, guest }, { delay });
  }
  
  // If delay is negative, send immediately
  return addEmailJob(EMAIL_JOB_TYPES.CHECKIN_REMINDER, { booking, guest });
};

/**
 * Schedule password reset email
 */
const schedulePasswordResetEmail = async (user, resetToken) => {
  return addEmailJob(EMAIL_JOB_TYPES.PASSWORD_RESET, { user, resetToken }, { priority: 1 });
};

/**
 * Schedule email verification email
 */
const scheduleEmailVerificationEmail = async (user, verificationToken) => {
  return addEmailJob(EMAIL_JOB_TYPES.EMAIL_VERIFICATION, { user, verificationToken }, { priority: 1 });
};

/**
 * Schedule invoice email
 */
const scheduleInvoiceEmail = async (invoice, booking, guest) => {
  return addEmailJob(EMAIL_JOB_TYPES.INVOICE, { invoice, booking, guest });
};

/**
 * Schedule contact confirmation email
 */
const scheduleContactConfirmationEmail = async (contact) => {
  return addEmailJob(EMAIL_JOB_TYPES.CONTACT_CONFIRMATION, { contact });
};

/**
 * Schedule activity confirmation email
 */
const scheduleActivityConfirmationEmail = async (activityBooking, guest) => {
  return addEmailJob(EMAIL_JOB_TYPES.ACTIVITY_CONFIRMATION, { activityBooking, guest });
};

/**
 * Schedule restaurant reservation email
 */
const scheduleRestaurantReservationEmail = async (reservation, guest) => {
  return addEmailJob(EMAIL_JOB_TYPES.RESTAURANT_RESERVATION, { reservation, guest });
};

/**
 * Schedule feedback request email
 */
const scheduleFeedbackRequestEmail = async (booking, guest) => {
  // Send after checkout
  const checkOutDate = new Date(booking.checkOut);
  const sendDate = new Date(checkOutDate);
  sendDate.setDate(sendDate.getDate() + 1);
  sendDate.setHours(10, 0, 0, 0); // 10 AM

  const delay = sendDate.getTime() - Date.now();
  
  if (delay > 0) {
    return addEmailJob(EMAIL_JOB_TYPES.FEEDBACK_REQUEST, { booking, guest }, { delay });
  }
  
  return addEmailJob(EMAIL_JOB_TYPES.FEEDBACK_REQUEST, { booking, guest });
};

/**
 * Schedule bulk newsletter
 */
const scheduleNewsletter = async (emails, content) => {
  const jobs = await Promise.all(
    emails.map(email => 
      addEmailJob(EMAIL_JOB_TYPES.NEWSLETTER, { email, ...content })
    )
  );
  
  return jobs;
};

/**
 * Send custom email
 */
const sendCustomEmail = async (to, subject, html, options = {}) => {
  return addEmailJob(
    EMAIL_JOB_TYPES.CUSTOM,
    { to, subject, html },
    { priority: options.priority || 3 }
  );
};

/**
 * Get email queue stats
 */
const getEmailQueueStats = async () => {
  const [
    waiting,
    active,
    completed,
    failed,
    delayed
  ] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount()
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
 * Clear completed jobs
 */
const clearCompletedJobs = async () => {
  await emailQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean jobs older than 24h
  logger.info('Email queue completed jobs cleared');
};

/**
 * Retry failed jobs
 */
const retryFailedJobs = async () => {
  const failedJobs = await emailQueue.getFailed();
  
  for (const job of failedJobs) {
    await job.retry();
  }
  
  logger.info(`Retry scheduled for ${failedJobs.length} failed email jobs`);
};

module.exports = {
  emailQueue,
  EMAIL_JOB_TYPES,
  addEmailJob,
  scheduleWelcomeEmail,
  scheduleBookingConfirmationEmail,
  scheduleBookingCancellationEmail,
  schedulePaymentConfirmationEmail,
  scheduleCheckInReminderEmail,
  schedulePasswordResetEmail,
  scheduleEmailVerificationEmail,
  scheduleInvoiceEmail,
  scheduleContactConfirmationEmail,
  scheduleActivityConfirmationEmail,
  scheduleRestaurantReservationEmail,
  scheduleFeedbackRequestEmail,
  scheduleNewsletter,
  sendCustomEmail,
  getEmailQueueStats,
  clearCompletedJobs,
  retryFailedJobs
};
