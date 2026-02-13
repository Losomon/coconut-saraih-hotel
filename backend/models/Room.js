const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['standard', 'suite', 'villa', 'deluxe'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  amenities: [String],
  images: [String],
  available: {
    type: Boolean,
    default: true
  },
  size: String,
  floor: Number,
  bedType: String
});

module.exports = mongoose.model('Room', roomSchema);
