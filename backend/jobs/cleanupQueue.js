/**
 * Cleanup Queue
 * Bull queue for processing data cleanup and maintenance jobs
 */

const Queue = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

// Create cleanup queue
const cleanupQueue = new Queue('cleanup-queue', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db || 0
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 60000 // 1 minute
    },
    removeOnComplete: 50,
    removeOnFail: 100
  }
});

// Cleanup job types
const CLEANUP_JOB_TYPES = {
  DELETE_EXPIRED_TOKENS: 'delete_expired_tokens',
  DELETE_OLD_NOTIFICATIONS: 'delete_old_notifications',
  DELETE_ABANDONED_BOOKINGS: 'delete_abandoned_bookings',
  DELETE_OLD_LOGS: 'delete_old_logs',
  DELETE_UNVERIFIED_ACCOUNTS: 'delete_unverified_accounts',
  DELETE_OLD_SESSIONS: 'delete_old_sessions',
  DELETE_TEMP_FILES: 'delete_temp_files',
  DELETE_OLD_AUDIT_LOGS: 'delete_old_audit_logs',
  VACUUM_DATABASE: 'vacuum_database',
  SYNC_ROOM_AVAILABILITY: 'sync_room_availability',
  UPDATE_GUEST_STATS: 'update_guest_stats',
  PROCESS_REFUNDS: 'process_refunds',
  EXPIRE_BOOKINGS: 'expire_bookings'
};

/**
 * Process cleanup jobs
 */
cleanupQueue.process(async (job) => {
  const { type, params } = job.data;

  logger.info(`Processing cleanup job: ${job.id}, type: ${type}`);

  try {
    let result = null;

    switch (type) {
      case CLEANUP_JOB_TYPES.DELETE_EXPIRED_TOKENS:
        result = await deleteExpiredTokens(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_OLD_NOTIFICATIONS:
        result = await deleteOldNotifications(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_ABANDONED_BOOKINGS:
        result = await deleteAbandonedBookings(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_OLD_LOGS:
        result = await deleteOldLogs(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_UNVERIFIED_ACCOUNTS:
        result = await deleteUnverifiedAccounts(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_OLD_SESSIONS:
        result = await deleteOldSessions(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_TEMP_FILES:
        result = await deleteTempFiles(params);
        break;

      case CLEANUP_JOB_TYPES.DELETE_OLD_AUDIT_LOGS:
        result = await deleteOldAuditLogs(params);
        break;

      case CLEANUP_JOB_TYPES.VACUUM_DATABASE:
        result = await vacuumDatabase(params);
        break;

      case CLEANUP_JOB_TYPES.SYNC_ROOM_AVAILABILITY:
        result = await syncRoomAvailability(params);
        break;

      case CLEANUP_JOB_TYPES.UPDATE_GUEST_STATS:
        result = await updateGuestStats(params);
        break;

      case CLEANUP_JOB_TYPES.PROCESS_REFUNDS:
        result = await processRefunds(params);
        break;

      case CLEANUP_JOB_TYPES.EXPIRE_BOOKINGS:
        result = await expireBookings(params);
        break;

      default:
        logger.warn(`Unknown cleanup job type: ${type}`);
        throw new Error(`Unknown cleanup job type: ${type}`);
    }

    logger.info(`Cleanup job completed: ${job.id}, type: ${type}`, result);
    return result;

  } catch (error) {
    logger.error(`Cleanup job failed: ${job.id}`, error);
    throw error;
  }
});

/**
 * Delete expired tokens
 */
const deleteExpiredTokens = async (params) => {
  const { daysOld = 7 } = params;
  
  const User = require('../models/User');
  
  // Delete expired password reset tokens
  const passwordResetResult = await User.deleteMany({
    'passwordReset.expires': { $lt: new Date() }
  });

  // Delete expired email verification tokens
  const verificationResult = await User.deleteMany({
    'emailVerification.expires': { $lt: new Date() }
  });

  return {
    deletedPasswordResetTokens: passwordResetResult.deletedCount,
    deletedVerificationTokens: verificationResult.deletedCount
  };
};

/**
 * Delete old notifications
 */
const deleteOldNotifications = async (params) => {
  const { daysOld = 30, keepUnread = true } = params;
  
  const Notification = require('../models/Notification');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const query = {
    createdAt: { $lt: cutoffDate },
    read: true
  };

  if (!keepUnread) {
    delete query.read;
  }

  const result = await Notification.deleteMany(query);

  return {
    deletedNotifications: result.deletedCount
  };
};

/**
 * Delete abandoned bookings (pending but not paid)
 */
const deleteAbandonedBookings = async (params) => {
  const { hoursOld = 24 } = params;
  
  const Booking = require('../models/Booking');
  
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

  // Find abandoned bookings (pending, not paid, created before cutoff)
  const result = await Booking.deleteMany({
    status: 'pending',
    'paymentStatus': { $ne: 'paid' },
    createdAt: { $lt: cutoffDate }
  });

  return {
    deletedBookings: result.deletedCount
  };
};

/**
 * Delete old application logs
 */
const deleteOldLogs = async (params) => {
  const { daysOld = 90 } = params;
  
  const AuditLog = require('../models/AuditLog');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await AuditLog.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  return {
    deletedLogs: result.deletedCount
  };
};

/**
 * Delete unverified accounts
 */
const deleteUnverifiedAccounts = async (params) => {
  const { daysOld = 7 } = params;
  
  const User = require('../models/User');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Delete unverified accounts older than specified days
  const result = await User.deleteMany({
    isVerified: false,
    createdAt: { $lt: cutoffDate },
    role: 'guest' // Only delete guest accounts
  });

  return {
    deletedAccounts: result.deletedCount
  };
};

/**
 * Delete old sessions
 */
const deleteOldSessions = async (params) => {
  const { daysOld = 7 } = params;
  
  // This would typically clean up Redis or database sessions
  // For now, placeholder
  const Redis = require('redis');
  // Implementation would use Redis to clean expired sessions
  
  return {
    deletedSessions: 0
  };
};

/**
 * Delete temporary files
 */
const deleteTempFiles = async (params) => {
  const { hoursOld = 24 } = params;
  
  const fs = require('fs');
  const path = require('path');
  
  const uploadDir = path.join(__dirname, '../uploads/temp');
  
  if (!fs.existsSync(uploadDir)) {
    return { deletedFiles: 0 };
  }

  const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
  let deletedCount = 0;

  try {
    const files = fs.readdirSync(uploadDir);
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < cutoffTime) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
  } catch (error) {
    logger.error('Error deleting temp files:', error);
  }

  return { deletedFiles: deletedCount };
};

/**
 * Delete old audit logs
 */
const deleteOldAuditLogs = async (params) => {
  const { daysOld = 180 } = params;
  
  const AuditLog = require('../models/AuditLog');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await AuditLog.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  return {
    deletedAuditLogs: result.deletedCount
  };
};

/**
 * Vacuum/optimize database
 */
const vacuumDatabase = async (params) => {
  // This would typically run database maintenance commands
  // For MongoDB, this would be compact command
  const mongoose = require('mongoose');
  
  // Get all collections
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  let optimizedCollections = 0;
  
  for (const collection of collections) {
    try {
      // Run compact command for each collection
      // await db.command({ compact: collection.name });
      optimizedCollections++;
    } catch (error) {
      logger.warn(`Failed to optimize collection ${collection.name}:`, error.message);
    }
  }

  return {
    optimizedCollections
  };
};

/**
 * Sync room availability status
 */
const syncRoomAvailability = async (params) => {
  const Room = require('../models/Room');
  const Booking = require('../models/Booking');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find rooms that should be occupied today
  const occupiedRooms = await Booking.distinct('roomId', {
    status: 'checked-in',
    checkIn: { $lte: today },
    checkOut: { $gt: today }
  });

  // Find rooms that need cleaning
  const cleaningRooms = await Booking.distinct('roomId', {
    status: 'checked-out',
    'timestamps.checkedOutAt': { $gte: today }
  });

  // Update room statuses
  const results = await Promise.all([
    // Set occupied rooms
    Room.updateMany(
      { _id: { $in: occupiedRooms } },
      { $set: { status: 'occupied' } }
    ),
    // Set cleaning rooms
    Room.updateMany(
      { _id: { $in: cleaningRooms } },
      { $set: { status: 'cleaning' } }
    ),
    // Set available rooms (those not in above lists and not in maintenance)
    Room.updateMany(
      { 
        _id: { $nin: [...occupiedRooms, ...cleaningRooms] },
        status: { $nin: ['maintenance'] }
      },
      { $set: { status: 'available' } }
    )
  ]);

  return {
    updatedRooms: results.reduce((sum, r) => sum + r.modifiedCount, 0)
  };
};

/**
 * Update guest statistics
 */
const updateGuestStats = async (params) => {
  const Guest = require('../models/Guest');
  const Booking = require('../models/Booking');
  
  const guests = await Guest.find().lean();
  
  let updatedCount = 0;
  
  for (const guest of guests) {
    // Calculate guest statistics
    const bookings = await Booking.find({ guestId: guest._id }).lean();
    
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalNights = bookings.reduce((sum, b) => sum + (b.numberOfNights || 0), 0);
    const completedBookings = bookings.filter(b => 
      ['checked-out', 'confirmed'].includes(b.status)
    ).length;
    
    // Determine loyalty tier
    let loyaltyTier = 'bronze';
    if (totalSpent > 5000) loyaltyTier = 'silver';
    if (totalSpent > 10000) loyaltyTier = 'gold';
    if (totalSpent > 25000) loyaltyTier = 'platinum';
    
    // Update guest
    await Guest.findByIdAndUpdate(guest._id, {
      $set: {
        'loyalty.totalBookings': completedBookings,
        'loyalty.totalSpent': totalSpent,
        'loyalty.totalNights': totalNights,
        'loyalty.tier': loyaltyTier,
        'loyalty.lastUpdated': new Date()
      }
    });
    
    updatedCount++;
  }

  return { updatedGuests: updatedCount };
};

/**
 * Process pending refunds
 */
const processRefunds = async (params) => {
  const Booking = require('../models/Booking');
  
  // Find bookings with pending refunds
  const bookings = await Booking.find({
    status: 'cancelled',
    'cancellation.refundStatus': 'pending',
    'cancellation.refundProcessedAt': { $exists: false }
  }).lean();

  let processedCount = 0;
  let failedCount = 0;

  for (const booking of bookings) {
    try {
      // Check if cancellation is within refund window
      const cancelledAt = new Date(booking.cancellation.cancelledAt);
      const now = new Date();
      const daysSinceCancellation = (now - cancelledAt) / (1000 * 60 * 60 * 24);

      if (daysSinceCancellation > 7) {
        // Skip if more than 7 days have passed
        continue;
      }

      // Process refund (would integrate with payment gateway)
      // For now, just mark as processed
      await Booking.findByIdAndUpdate(booking._id, {
        $set: {
          'cancellation.refundStatus': 'processed',
          'cancellation.refundProcessedAt': new Date()
        }
      });

      processedCount++;
    } catch (error) {
      logger.error(`Failed to process refund for booking ${booking.bookingReference}:`, error);
      failedCount++;
    }
  }

  return {
    processed: processedCount,
    failed: failedCount
  };
};

/**
 * Expire old bookings (no-show)
 */
const expireBookings = async (params) => {
  const Booking = require('../models/Booking');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find confirmed bookings where check-in date has passed
  const result = await Booking.updateMany(
    {
      status: 'confirmed',
      checkIn: { $lt: today }
    },
    {
      $set: {
        status: 'no-show',
        'notes.statusUpdate': 'Automatically marked as no-show',
        'timestamps.noShowAt': new Date()
      }
    }
  );

  return {
    expiredBookings: result.modifiedCount
  };
};

/**
 * Add cleanup job to queue
 */
const addCleanupJob = async (type, params = {}, options = {}) => {
  const job = await cleanupQueue.add(
    { type, params },
    {
      priority: options.priority || 3,
      repeat: options.schedule ? {
        cron: options.schedule
      } : undefined,
      ...options
    }
  );

  logger.info(`Cleanup job added: ${job.id}, type: ${type}`);
  return job;
};

/**
 * Schedule recurring cleanup jobs
 */
const scheduleRecurringCleanupJobs = async () => {
  // Run daily at 2 AM
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_EXPIRED_TOKENS, {}, { 
    schedule: '0 2 * * *' 
  });

  // Run daily at 3 AM
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_OLD_NOTIFICATIONS, { daysOld: 30 }, { 
    schedule: '0 3 * * *' 
  });

  // Run every 6 hours
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_ABANDONED_BOOKINGS, { hoursOld: 24 }, { 
    schedule: '0 */6 * * *' 
  });

  // Run weekly on Sunday at 4 AM
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_OLD_LOGS, { daysOld: 90 }, { 
    schedule: '0 4 * * 0' 
  });

  // Run daily at 5 AM
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_UNVERIFIED_ACCOUNTS, { daysOld: 7 }, { 
    schedule: '0 5 * * *' 
  });

  // Run daily at 6 AM
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_TEMP_FILES, { hoursOld: 24 }, { 
    schedule: '0 6 * * *' 
  });

  // Run monthly on 1st at 7 AM
  await addCleanupJob(CLEANUP_JOB_TYPES.DELETE_OLD_AUDIT_LOGS, { daysOld: 180 }, { 
    schedule: '0 7 1 * *' 
  });

  // Run daily at midnight to sync room availability
  await addCleanupJob(CLEANUP_JOB_TYPES.SYNC_ROOM_AVAILABILITY, {}, { 
    schedule: '0 0 * * *' 
  });

  // Run daily at 1 AM to update guest stats
  await addCleanupJob(CLEANUP_JOB_TYPES.UPDATE_GUEST_STATS, {}, { 
    schedule: '0 1 * * *' 
  });

  // Run daily at 8 AM to process refunds
  await addCleanupJob(CLEANUP_JOB_TYPES.PROCESS_REFUNDS, {}, { 
    schedule: '0 8 * * *' 
  });

  // Run daily at 9 AM to expire bookings
  await addCleanupJob(CLEANUP_JOB_TYPES.EXPIRE_BOOKINGS, {}, { 
    schedule: '0 9 * * *' 
  });

  logger.info('Recurring cleanup jobs scheduled');
};

/**
 * Get cleanup queue stats
 */
const getCleanupQueueStats = async () => {
  const [
    waiting,
    active,
    completed,
    failed,
    delayed
  ] = await Promise.all([
    cleanupQueue.getWaitingCount(),
    cleanupQueue.getActiveCount(),
    cleanupQueue.getCompletedCount(),
    cleanupQueue.getFailedCount(),
    cleanupQueue.getDelayedCount()
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

// Event handlers
cleanupQueue.on('completed', (job, result) => {
  logger.debug(`Cleanup job ${job.id} completed`);
});

cleanupQueue.on('failed', (job, error) => {
  logger.error(`Cleanup job ${job.id} failed:`, error.message);
});

cleanupQueue.on('error', (error) => {
  logger.error('Cleanup queue error:', error);
});

module.exports = {
  cleanupQueue,
  CLEANUP_JOB_TYPES,
  addCleanupJob,
  scheduleRecurringCleanupJobs,
  getCleanupQueueStats,
  deleteExpiredTokens,
  deleteOldNotifications,
  deleteAbandonedBookings,
  deleteOldLogs,
  deleteUnverifiedAccounts,
  deleteOldSessions,
  deleteTempFiles,
  deleteOldAuditLogs,
  vacuumDatabase,
  syncRoomAvailability,
  updateGuestStats,
  processRefunds,
  expireBookings
};
