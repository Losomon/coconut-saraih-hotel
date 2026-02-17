const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['website', 'checkout', 'booking'],
    default: 'website'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  preferences: {
    promotions: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    events: { type: Boolean, default: true }
  }
});

// Index for efficient querying
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ subscribed: 1 });
newsletterSchema.index({ subscribedAt: -1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
