const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['wellness', 'water', 'adventure', 'entertainment', 'culinary'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: String,
  price: {
    type: Number,
    required: true
  },
  maxParticipants: Number,
  images: [String],
  available: {
    type: Boolean,
    default: true
  },
  location: String,
  schedule: String,
  equipment: [String]
});

module.exports = mongoose.model('Activity', activitySchema);
