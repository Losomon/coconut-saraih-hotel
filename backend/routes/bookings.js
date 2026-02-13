const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, checkIn, checkOut } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (checkIn) query.checkIn = { $gte: new Date(checkIn) };
    if (checkOut) query.checkOut = { $lte: new Date(checkOut) };

    const bookings = await Booking.find(query)
      .populate('guest', 'name email')
      .populate('room', 'name type');
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('room', 'name type images');
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone')
      .populate('room', 'name type price amenities');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if user owns booking or is admin
    if (booking.guest._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { room, checkIn, checkOut, adults, children, specialRequests } = req.body;

    // Check room availability
    const existingBooking = await Booking.findOne({
      room,
      status: { $nin: ['cancelled'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
        { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'Room not available for selected dates' });
    }

    // Calculate total price
    const roomData = await Room.findById(room);
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = roomData.price * nights;

    const booking = await Booking.create({
      guest: req.user._id,
      room,
      checkIn,
      checkOut,
      adults,
      children,
      totalPrice,
      specialRequests
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private (Admin or Owner)
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(booking, req.body);
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
