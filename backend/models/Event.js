const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['wedding', 'conference', 'birthday', 'corporate', 'social', 'other'],
    required: true
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventHall',
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  organizerEmail: {
    type: String,
    required: true
  },
  organizerPhone: String,
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  expectedAttendees: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['inquiry', 'pending', 'confirmed', 'completed', 'cancelled'],
    default: 'inquiry'
  },
  services: [String],
  totalCost: Number,
  depositPaid: {
    type: Boolean,
    default: false
  },
  specialRequirements: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
