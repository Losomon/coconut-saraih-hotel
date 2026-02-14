/**
 * AuditLog Model
 * Tracks all user actions and system events for compliance
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true,
    enum: [
      // Authentication actions
      'login',
      'logout',
      'login_failed',
      'password_change',
      'password_reset',
      'email_verified',
      'token_refresh',
      
      // User management
      'user_create',
      'user_update',
      'user_delete',
      'user_role_change',
      'user_status_change',
      
      // Booking actions
      'booking_create',
      'booking_update',
      'booking_cancel',
      'booking_check_in',
      'booking_check_out',
      'booking_no_show',
      'booking_extend',
      'booking_modify',
      
      // Payment actions
      'payment_initiate',
      'payment_complete',
      'payment_failed',
      'payment_refund',
      'payment_cancel',
      
      // Room management
      'room_create',
      'room_update',
      'room_delete',
      'room_status_change',
      'room_maintenance',
      'room_housekeeping',
      
      // Activity actions
      'activity_create',
      'activity_book',
      'activity_cancel',
      
      // Restaurant actions
      'reservation_create',
      'reservation_update',
      'reservation_cancel',
      'order_create',
      'order_update',
      'order_complete',
      
      // Event actions
      'event_inquiry',
      'event_create',
      'event_update',
      'event_cancel',
      
      // Staff actions
      'staff_create',
      'staff_update',
      'staff_delete',
      'staff_schedule_change',
      'staff_leave_approve',
      'staff_leave_reject',
      
      // System actions
      'system_config_change',
      'system_backup',
      'system_restore',
      'api_key_create',
      'api_key_revoke',
      
      // Export/Import
      'data_export',
      'data_import',
      
      // General
      'file_upload',
      'file_delete',
      'settings_change',
      'notification_sent'
    ]
  },
  entity: {
    type: String,
    index: true,
    enum: [
      'User',
      'Booking',
      'Payment',
      'Room',
      'Activity',
      'Guest',
      'Restaurant',
      'MenuItem',
      'TableReservation',
      'Event',
      'EventHall',
      'Staff',
      'SpaService',
      'Feedback',
      'Notification',
      'Analytics',
      'System',
      'ApiKey',
      'File'
    ]
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fields: [String]
  },
  metadata: {
    ipAddress: {
      type: String,
      validate: {
        validator: function(v) {
          // Simple IPv4 validation
          return /^(\d{1,3}\.){3}\d{1,3}$/.test(v) || v === 'unknown';
        }
      }
    },
    userAgent: String,
    sessionId: String,
    requestId: String,
    location: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    device: {
      type: String,
      browser: String,
      os: String,
      isMobile: Boolean
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    },
    errorMessage: String,
    duration: Number, // in milliseconds
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  description: {
    type: String
  },
  tags: [String]
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false },
  capped: { size: 1073741824, max: 1000000 } // 1GB cap, max 1M documents
});

// Compound indexes for efficient queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }, { expireAfterSeconds: 31536000 }); // Auto-delete after 1 year
auditLogSchema.index({ 'metadata.ipAddress': 1, timestamp: -1 });
auditLogSchema.index({ tags: 1, timestamp: -1 });

// Static method to log an action
auditLogSchema.statics.log = async function(data) {
  try {
    return await this.create({
      user: data.userId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      changes: data.changes,
      metadata: {
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        requestId: data.requestId,
        status: data.status || 'success',
        errorMessage: data.errorMessage,
        duration: data.duration,
        additionalInfo: data.additionalInfo
      },
      description: data.description,
      tags: data.tags || []
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const { limit = 50, page = 1, startDate, endDate, action } = options;
  
  const query = { user: userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (action) {
    query.action = action;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'email firstName lastName role');
};

// Static method to get entity history
auditLogSchema.statics.getEntityHistory = async function(entity, entityId, options = {}) {
  const { limit = 50, page = 1, startDate, endDate } = options;
  
  const query = { entity, entityId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'email firstName lastName role');
};

// Static method to get failed actions
auditLogSchema.statics.getFailedActions = async function(startDate, endDate, options = {}) {
  const { limit = 100, page = 1 } = options;
  
  return this.find({
    'metadata.status': 'failed',
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'email firstName lastName role');
};

// Static method for security audit
auditLogSchema.statics.getSecurityAudit = async function(startDate, endDate) {
  const securityActions = [
    'login',
    'logout',
    'login_failed',
    'password_change',
    'password_reset',
    'user_role_change',
    'user_status_change',
    'api_key_create',
    'api_key_revoke'
  ];
  
  return this.find({
    action: { $in: securityActions },
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
    .sort({ timestamp: -1 })
    .populate('user', 'email firstName lastName role');
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
