const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
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
    required: true,
    unique: true
  },
  phone: String,
  role: {
    type: String,
    enum: ['manager', 'receptionist', 'housekeeping', 'chef', 'waiter', 'bartender', 'security', 'maintenance', 'spa-therapist', 'activities-guide'],
    required: true
  },
  department: String,
  salary: Number,
  hireDate: Date,
  status: {
    type: String,
    enum: ['active', 'on-leave', 'terminated'],
    default: 'active'
  },
  schedule: String,
  emergencyContact: {
    name: String,
    phone: String
  },
  address: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Staff', staffSchema);
