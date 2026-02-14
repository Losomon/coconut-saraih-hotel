const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const paymentService = require('../services/payment.service');

// @route   POST /api/v1/payments/initiate
// @desc    Initiate payment
// @access  Private
exports.initiatePayment = catchAsync(async (req, res) => {
  const { bookingId, amount, currency, method, gateway, returnUrl } = req.body;

  // Verify booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Check if already paid
  if (booking.payment?.status === 'paid') {
    throw new ApiError(400, 'Booking is already paid');
  }

  // Create payment record
  const payment = await Payment.create({
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    booking: bookingId,
    user: req.user._id,
    type: 'booking',
    amount,
    currency: currency || 'USD',
    method,
    gateway,
    status: 'pending'
  });

  // Process payment based on gateway
  let paymentResult;
  
  if (gateway === 'stripe') {
    paymentResult = await paymentService.processStripePayment({
      amount,
      currency,
      paymentId: payment._id,
      returnUrl
    });
  } else if (gateway === 'mpesa') {
    paymentResult = await paymentService.processMpesaPayment({
      amount,
      phone: req.body.phoneNumber,
      paymentId: payment._id
    });
  } else if (gateway === 'paypal') {
    paymentResult = await paymentService.processPaypalPayment({
      amount,
      currency,
      paymentId: payment._id
    });
  }

  // Update payment with gateway response
  payment.gatewayResponse = paymentResult;
  if (paymentResult.clientSecret) {
    payment.metadata = { clientSecret: paymentResult.clientSecret };
  }
  await payment.save();

  ApiResponse.success(res, {
    paymentId: payment._id,
    clientSecret: paymentResult.clientSecret,
    paymentUrl: paymentResult.paymentUrl,
    expiresAt: paymentResult.expiresAt
  }, 'Payment initiated successfully');
});

// @route   POST /api/v1/payments/webhook/stripe
// @desc    Handle Stripe webhook
// @access  Public (Stripe calls this)
exports.stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = paymentService.verifyStripeWebhook(req.body, sig);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await paymentService.handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await paymentService.handleFailedPayment(event.data.object);
        break;
      case 'charge.refunded':
        await paymentService.handleRefund(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// @route   POST /api/v1/payments/webhook/mpesa
// @desc    Handle M-Pesa callback
// @access  Public (M-Pesa calls this)
exports.mpesaWebhook = catchAsync(async (req, res) => {
  const { Body } = req.body;

  if (!Body || !Body.stkCallback) {
    return res.json({ ResultCode: 0, ResultDesc: 'Received' });
  }

  const callbackData = Body.stkCallback;

  if (callbackData.ResultCode === 0) {
    // Success
    await paymentService.handleMpesaSuccess(callbackData);
  } else {
    // Failed
    await paymentService.handleMpesaFailure(callbackData);
  }

  res.json({ ResultCode: 0, ResultDesc: 'Received' });
});

// @route   GET /api/v1/payments/:id
// @desc    Get payment details
// @access  Private
exports.getPayment = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking', 'bookingReference checkIn checkOut')
    .populate('user', 'name email');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  // Check authorization
  const isOwner = payment.user._id.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized');
  }

  ApiResponse.success(res, { payment });
});

// @route   GET /api/v1/payments/booking/:bookingId
// @desc    Get payments for a booking
// @access  Private
exports.getBookingPayments = catchAsync(async (req, res) => {
  const payments = await Payment.find({ booking: req.params.bookingId })
    .sort({ createdAt: -1 });

  ApiResponse.success(res, { payments });
});

// @route   POST /api/v1/payments/:id/refund
// @desc    Process refund
// @access  Private (Admin)
exports.processRefund = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;

  const payment = await Payment.findById(req.params.id)
    .populate('booking');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.status !== 'completed') {
    throw new ApiError(400, 'Can only refund completed payments');
  }

  if (payment.refund?.amount > 0) {
    throw new ApiError(400, 'Payment already refunded');
  }

  // Process refund
  let refundResult;
  
  if (payment.gateway === 'stripe') {
    refundResult = await paymentService.refundStripePayment(payment, amount);
  } else if (payment.gateway === 'mpesa') {
    refundResult = await paymentService.refundMpesaPayment(payment, amount);
  }

  // Update payment
  payment.refund = {
    amount: amount || payment.amount,
    reason,
    processedAt: new Date(),
    refundId: refundResult.refundId
  };
  payment.status = 'refunded';
  await payment.save();

  // Update booking payment status
  if (payment.booking) {
    await Booking.findByIdAndUpdate(payment.booking._id, {
      'payment.status': 'refunded'
    });
  }

  ApiResponse.success(res, { payment }, 'Refund processed successfully');
});

// @route   GET /api/v1/payments/receipt/:id
// @desc    Download payment receipt
// @access  Private
exports.getReceipt = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'name email');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  // Check authorization
  const isOwner = payment.user._id.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized');
  }

  // Generate PDF receipt (placeholder)
  // const receipt = await pdfService.generateReceipt(payment);

  ApiResponse.success(res, {
    payment,
    receiptUrl: `/api/v1/payments/receipt/${payment._id}.pdf`
  });
});

// @route   GET /api/v1/payments
// @desc    Get all payments
// @access  Private (Admin)
exports.getAllPayments = catchAsync(async (req, res) => {
  const { status, method, gateway, startDate, endDate, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (status) query.status = status;
  if (method) query.method = method;
  if (gateway) query.gateway = gateway;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('booking', 'bookingReference')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, payments, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Payments retrieved successfully');
});

// @route   GET /api/v1/payments/stats
// @desc    Get payment statistics
// @access  Private (Admin)
exports.getPaymentStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  } else {
    // Default to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateFilter.$gte = today;
  }

  const stats = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  const byMethod = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: '$method',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const byGateway = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: '$gateway',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  ApiResponse.success(res, {
    summary: stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 },
    byMethod,
    byGateway
  });
});

// @route   POST /api/v1/payments/verify/:id
// @desc    Verify payment status
// @access  Private
exports.verifyPayment = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  // Check with gateway
  let verification;
  if (payment.gateway === 'stripe') {
    verification = await paymentService.verifyStripePayment(payment);
  } else if (payment.gateway === 'mpesa') {
    verification = await paymentService.verifyMpesaPayment(payment);
  }

  // Update payment if verified
  if (verification?.verified) {
    payment.status = verification.status;
    await payment.save();
  }

  ApiResponse.success(res, {
    paymentId: payment._id,
    status: payment.status,
    verified: verification?.verified || false
  });
});
