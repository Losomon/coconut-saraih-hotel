const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  nationality: String,
  idType: {
    type: String,
    enum: ['passport', 'national-id', 'drivers-license']
  },
  idNumber: String,
  address: String,
  preferences: {
    roomType: String,
    bedType: String,
    dietary: [String],
    specialNeeds: String
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalStays: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Guest', guestSchema);
