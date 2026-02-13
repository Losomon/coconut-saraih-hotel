const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, isPublic } = req.query;
    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/feedback/public
// @desc    Get public feedback
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const feedback = await Feedback.find({ isPublic: true, status: 'responded' })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get single feedback
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/feedback
// @desc    Create feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { guestName, guestEmail, type, rating, title, comment, stayDate, isPublic } = req.body;

    const feedback = await Feedback.create({
      guestName,
      guestEmail,
      type,
      rating,
      title,
      comment,
      stayDate,
      isPublic: isPublic || false
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback
// @access  Private (Admin)
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { response } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        response,
        responseDate: new Date(),
        status: 'responded'
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback status
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
