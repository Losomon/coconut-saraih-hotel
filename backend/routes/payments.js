const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, method } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (method) query.method = method;

    const payments = await Payment.find(query)
      .populate('guest', 'name email')
      .populate('booking', 'checkIn checkOut')
      .sort({ paymentDate: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payments/my
// @desc    Get current user's payments
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ guest: req.user._id })
      .populate('booking', 'checkIn checkOut room')
      .sort({ paymentDate: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private (Admin or Owner)
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('guest', 'name email phone')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.guest._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments
// @desc    Create payment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, amount, method, description } = req.body;

    const payment = await Payment.create({
      booking: bookingId,
      guest: req.user._id,
      amount,
      method,
      description,
      status: 'completed',
      paymentDate: new Date()
    });

    // Update booking payment status if needed
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
    }

    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/:id/refund
// @desc    Refund payment
// @access  Private (Admin)
router.post('/:id/refund', protect, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = amount === payment.amount ? 'refunded' : 'partially-refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;
    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
