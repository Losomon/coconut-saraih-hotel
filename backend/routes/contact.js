const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory storage for contact messages (replace with database in production)
let contactMessages = [];

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, read } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (read !== undefined) query.read = read === 'true';

    const messages = contactMessages.filter(m => {
      if (status && m.status !== status) return false;
      if (read !== undefined && m.read !== (read === 'true')) return false;
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const message = contactMessages.find(m => m._id === req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/contact
// @desc    Submit contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, department } = req.body;

    const newMessage = {
      _id: Date.now().toString(),
      name,
      email,
      phone,
      subject,
      message,
      department: department || 'general',
      status: 'new',
      read: false,
      createdAt: new Date()
    };

    contactMessages.push(newMessage);

    res.status(201).json({ 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.',
      data: newMessage 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update message status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const messageIndex = contactMessages.findIndex(m => m._id === req.params.id);
    
    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    contactMessages[messageIndex].status = status;
    res.json({ success: true, message: contactMessages[messageIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/contact/:id/read
// @desc    Mark message as read
// @access  Private (Admin)
router.put('/:id/read', protect, async (req, res) => {
  try {
    const messageIndex = contactMessages.findIndex(m => m._id === req.params.id);
    
    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    contactMessages[messageIndex].read = true;
    res.json({ success: true, message: contactMessages[messageIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
