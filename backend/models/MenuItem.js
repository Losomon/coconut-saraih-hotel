const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['appetizer', 'main', 'dessert', 'beverage', 'special'],
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
  image: String,
  available: {
    type: Boolean,
    default: true
  },
  dietary: {
    type: [String],
    enum: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher']
  },
  allergens: [String],
  preparationTime: String,
  spicyLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot']
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
