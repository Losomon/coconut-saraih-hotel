const mongoose = require('mongoose');

const spaServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['massage', 'facial', 'body-treatment', 'nail-care', 'hair-care', 'package'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: String,
  available: {
    type: Boolean,
    default: true
  },
  benefits: [String],
  contraindications: [String],
  preparationInstructions: String,
  aftercareInstructions: String,
  suitableFor: [String]
});

module.exports = mongoose.model('SpaService', spaServiceSchema);
