const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const { protect } = require('../middleware/auth');

// @route   GET /api/guests
// @desc    Get all guests
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.json({ success: true, count: guests.length, guests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/guests/:id
// @desc    Get single guest
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.json({ success: true, guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/guests
// @desc    Create guest profile
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const guest = await Guest.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json({ success: true, guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/guests/:id
// @desc    Update guest
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.json({ success: true, guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/guests/:id/loyalty
// @desc    Add loyalty points
// @access  Private (Admin)
router.put('/:id/loyalty', protect, async (req, res) => {
  try {
    const { points } = req.body;
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { $inc: { loyaltyPoints: points } },
      { new: true }
    );
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.json({ success: true, guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
