const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventHall = require('../models/EventHall');
const { protect } = require('../middleware/auth');

// Event Halls Routes
router.get('/halls', async (req, res) => {
  try {
    const halls = await EventHall.find({ available: true });
    res.json({ success: true, count: halls.length, halls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/halls/:id', async (req, res) => {
  try {
    const hall = await EventHall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Event hall not found' });
    }
    res.json({ success: true, hall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/halls', protect, async (req, res) => {
  try {
    const hall = await EventHall.create(req.body);
    res.status(201).json({ success: true, hall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Events Routes
router.get('/', async (req, res) => {
  try {
    const { status, date, type } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (date) query.date = { $eq: new Date(date) };

    const events = await Event.find(query)
      .populate('hall', 'name capacity')
      .sort({ date: 1 });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('hall');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
