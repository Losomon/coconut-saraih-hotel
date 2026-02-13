const mongoose = require('mongoose');

const eventHallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  capacity: {
    type: Number,
    required: true
  },
  area: String,
  amenities: [String],
  images: [String],
  hourlyRate: Number,
  fullDayRate: Number,
  available: {
    type: Boolean,
    default: true
  },
  suitableFor: [String]
});

module.exports = mongoose.model('EventHall', eventHallSchema);
