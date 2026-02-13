const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'room', 'restaurant', 'spa', 'activity', 'staff'],
    default: 'general'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  title: String,
  comment: {
    type: String,
    required: true
  },
  stayDate: Date,
  response: String,
  responseDate: Date,
  status: {
    type: String,
    enum: ['new', 'read', 'responded', 'archived'],
    default: 'new'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
