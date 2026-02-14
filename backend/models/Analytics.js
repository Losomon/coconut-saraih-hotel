/**
 * Analytics Model
 * Stores daily analytics and metrics
 */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  metrics: {
    occupancyRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageDailyRate: {
      type: Number,
      default: 0
    },
    revPAR: {
      type: Number,
      default: 0
    },
    bookings: {
      total: { type: Number, default: 0 },
      confirmed: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
      noShows: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    },
    guests: {
      checkIns: { type: Number, default: 0 },
      checkOuts: { type: Number, default: 0 },
      inHouse: { type: Number, default: 0 },
      newGuests: { type: Number, default: 0 },
      returningGuests: { type: Number, default: 0 }
    },
    restaurant: {
      covers: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      averageSpend: { type: Number, default: 0 },
      reservations: { type: Number, default: 0 }
    },
    activities: {
      bookings: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      participants: { type: Number, default: 0 }
    },
    spa: {
      bookings: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      treatments: { type: Number, default: 0 }
    },
    events: {
      bookings: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      expectedGuests: { type: Number, default: 0 }
    }
  },
  breakdown: {
    byRoomType: {
      standard: { bookings: Number, revenue: Number, nights: Number },
      deluxe: { bookings: Number, revenue: Number, nights: Number },
      suite: { bookings: Number, revenue: Number, nights: Number },
      presidential: { bookings: Number, revenue: Number, nights: Number }
    },
    bySource: {
      web: { bookings: Number, revenue: Number },
      mobile: { bookings: Number, revenue: Number },
      phone: { bookings: Number, revenue: Number },
      walkIn: { bookings: Number, revenue: Number },
      travelAgent: { bookings: Number, revenue: Number }
    },
    byNationality: {
      type: Map,
      of: { bookings: Number, revenue: Number }
    },
    byPaymentMethod: {
      card: { transactions: Number, revenue: Number },
      mpesa: { transactions: Number, revenue: Number },
      paypal: { transactions: Number, revenue: Number },
      cash: { transactions: Number, revenue: Number },
      bankTransfer: { transactions: Number, revenue: Number }
    }
  },
  weather: {
    condition: String,
    temperature: Number,
    impact: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    }
  },
  specialEvents: [String],
  notes: String
}, {
  timestamps: true
});

// Compound index for date range queries
analyticsSchema.index({ date: -1 });

// Static method to get analytics for date range
analyticsSchema.statics.getRange = async function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: 1 });
};

// Static method to get aggregated metrics
analyticsSchema.statics.getAggregatedMetrics = async function(startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$metrics.totalRevenue' },
        totalBookings: { $sum: '$metrics.bookings.total' },
        totalCheckIns: { $sum: '$metrics.guests.checkIns' },
        totalCheckOuts: { $sum: '$metrics.guests.checkOuts' },
        avgOccupancy: { $avg: '$metrics.occupancyRate' },
        avgADR: { $avg: '$metrics.averageDailyRate' },
        avgRevPAR: { $avg: '$metrics.revPAR' },
        restaurantRevenue: { $sum: '$metrics.restaurant.revenue' },
        activitiesRevenue: { $sum: '$metrics.activities.revenue' },
        spaRevenue: { $sum: '$metrics.spa.revenue' },
        eventsRevenue: { $sum: '$metrics.events.revenue' }
      }
    }
  ]);
  
  return result[0] || {};
};

// Static method to get today's metrics
analyticsSchema.statics.getToday = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.findOne({ date: today });
};

// Method to update metrics
analyticsSchema.methods.incrementMetric = async function(category, subCategory, value = 1) {
  const path = `metrics.${category}.${subCategory}`;
  this.markModified(path);
  await this.updateOne({ $inc: { [path]: value } });
};

// Pre-save middleware to calculate derived metrics
analyticsSchema.pre('save', function(next) {
  // Calculate RevPAR
  if (this.metrics.totalRevenue && this.metrics.occupancyRate) {
    this.metrics.revPAR = this.metrics.totalRevenue * (this.metrics.occupancyRate / 100);
  }
  next();
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
