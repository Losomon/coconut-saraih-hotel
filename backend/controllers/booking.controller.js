const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const bookingService = require('../services/booking.service');

// @route   GET /api/v1/bookings
// @desc    Get all bookings
// @access  Private (Admin/Manager)
exports.getAllBookings = catchAsync(async (req, res) => {
  const { status, checkIn, checkOut, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (status) query.status = status;
  if (checkIn) query.checkIn = { $gte: new Date(checkIn) };
  if (checkOut) query.checkOut = { $lte: new Date(checkOut) };

  // Role-based filtering
  if (req.user.role === 'staff') {
    // Staff can see all bookings
  } else if (req.user.role === 'guest') {
    query.guest = req.user._id;
  }

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('guest', 'name email phone personalInfo')
    .populate('room', 'roomNumber type name price amenities images')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, bookings, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Bookings retrieved successfully');
});

// @route   GET /api/v1/bookings/my
// @desc    Get current user's bookings
// @access  Private
exports.getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate('room', 'roomNumber type name price amenities images description')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, { bookings });
});

// @route   GET /api/v1/bookings/:id
// @desc    Get single booking
// @access  Private
exports.getBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('guest', 'name email phone personalInfo preferences')
    .populate('room', 'roomNumber type name price amenities images description features')
    .populate('user', 'name email')
    .populate('payment.transactions');
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  
  // Check authorization
  const isOwner = booking.guest._id.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);
  
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to view this booking');
  }

  ApiResponse.success(res, { booking });
});

// @route   POST /api/v1/bookings
// @desc    Create a new booking
// @access  Private
exports.createBooking = catchAsync(async (req, res) => {
  const { 
    room, 
    checkIn, 
    checkOut, 
    adults, 
    children, 
    specialRequests,
    promoCode,
    guestInfo
  } = req.body;

  // Check room availability
  const isAvailable = await bookingService.checkAvailability(room, checkIn, checkOut);
  if (!isAvailable) {
    throw new ApiError(400, 'Room not available for selected dates');
  }

  // Calculate pricing
  const pricing = await bookingService.calculatePricing(room, checkIn, checkOut, promoCode);

  // Create or find guest
  let guest;
  if (req.user.role === 'guest') {
    guest = await Guest.findOne({ user: req.user._id });
    if (!guest && guestInfo) {
      guest = await Guest.create({
        user: req.user._id,
        personalInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          nationality: guestInfo.nationality
        }
      });
    }
  } else if (guestInfo) {
    guest = await Guest.create({
      personalInfo: {
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        nationality: guestInfo.nationality
      }
    });
  }

  // Generate booking reference
  const bookingReference = bookingService.generateBookingReference();

  // Create booking
  const booking = await Booking.create({
    bookingReference,
    guest: guest?._id || req.user._id,
    user: req.user._id,
    room,
    checkIn,
    checkOut,
    adults: adults || 1,
    children: children || 0,
    pricing,
    specialRequests,
    status: 'pending',
    source: 'web'
  });

  // Populate the booking
  await booking.populate([
    { path: 'room', select: 'roomNumber type name price amenities images' },
    { path: 'guest', select: 'name email phone personalInfo' }
  ]);

  // TODO: Send confirmation email
  // await emailService.sendBookingConfirmation(booking);

  ApiResponse.created(res, { booking }, 'Booking created successfully. Please complete payment.');
});

// @route   PUT /api/v1/bookings/:id
// @desc    Update booking
// @access  Private
exports.updateBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Check authorization
  const isOwner = booking.guest.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);
  
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to update this booking');
  }

  // Only allow certain updates for guests
  const allowedUpdates = ['specialRequests', 'guests'];
  if (req.user.role === 'guest') {
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
    if (!isValidUpdate) {
      throw new ApiError(400, 'Invalid updates for your role');
    }
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'room', select: 'roomNumber type name price amenities' },
    { path: 'guest', select: 'name email phone' }
  ]);

  ApiResponse.success(res, { booking: updatedBooking }, 'Booking updated successfully');
});

// @route   PATCH /api/v1/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin/Manager)
exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'];
  
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate([
    { path: 'room', select: 'roomNumber type' },
    { path: 'guest', select: 'name email phone' }
  ]);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // If checking in, update room status
  if (status === 'checked-in') {
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });
  }

  // If checking out, update room status
  if (status === 'checked-out') {
    await Room.findByIdAndUpdate(booking.room._id, { status: 'cleaning' });
  }

  // If cancelling, free up the room
  if (status === 'cancelled') {
    await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
  }

  ApiResponse.success(res, { booking }, `Booking status updated to ${status}`);
});

// @route   POST /api/v1/bookings/:id/check-in
// @desc    Process check-in
// @access  Private (Staff/Admin)
exports.checkIn = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== 'confirmed') {
    throw new ApiError(400, 'Booking must be confirmed before check-in');
  }

  booking.status = 'checked-in';
  booking.checkIn = new Date();
  await booking.save();

  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'occupied' });

  // Populate and return
  await booking.populate([
    { path: 'room', select: 'roomNumber type' },
    { path: 'guest', select: 'name email phone' }
  ]);

  ApiResponse.success(res, { booking }, 'Check-in successful');
});

// @route   POST /api/v1/bookings/:id/check-out
// @desc    Process check-out
// @access  Private (Staff/Admin)
exports.checkOut = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== 'checked-in') {
    throw new ApiError(400, 'Guest must be checked in before check-out');
  }

  booking.status = 'checked-out';
  booking.checkOut = new Date();
  await booking.save();

  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'cleaning' });

  // Populate and return
  await booking.populate([
    { path: 'room', select: 'roomNumber type' },
    { path: 'guest', select: 'name email phone' }
  ]);

  ApiResponse.success(res, { booking }, 'Check-out successful');
});

// @route   DELETE /api/v1/bookings/:id
// @desc    Cancel booking
// @access  Private
exports.cancelBooking = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Check authorization
  const isOwner = booking.guest.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);
  
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to cancel this booking');
  }

  // Check if can be cancelled
  if (['checked-in', 'checked-out', 'cancelled'].includes(booking.status)) {
    throw new ApiError(400, 'Booking cannot be cancelled');
  }

  // Calculate refund if applicable
  let refundAmount = 0;
  if (booking.payment?.status === 'paid') {
    refundAmount = await bookingService.calculateRefund(booking);
  }

  booking.status = 'cancelled';
  booking.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: req.user._id,
    reason: reason || 'Guest cancelled',
    refundAmount
  };
  await booking.save();

  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'available' });

  ApiResponse.success(res, { booking, refundAmount }, 'Booking cancelled successfully');
});

// @route   GET /api/v1/bookings/:id/invoice
// @desc    Generate and download invoice
// @access  Private
exports.getInvoice = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('guest', 'name email personalInfo')
    .populate('room', 'roomNumber type name price');
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Check authorization
  const isOwner = booking.guest._id.toString() === req.user._id?.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user.role);
  
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized');
  }

  // Generate PDF invoice (placeholder - would use pdf service)
  // const pdfBuffer = await pdfService.generateInvoice(booking);
  
  ApiResponse.success(res, { 
    booking,
    invoiceUrl: `/api/v1/bookings/${booking._id}/invoice.pdf`
  }, 'Invoice generated');
});

// @route   GET /api/v1/bookings/availability/:roomId
// @desc    Check room availability
// @access  Public
exports.checkAvailability = catchAsync(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  const { roomId } = req.params;

  if (!checkIn || !checkOut) {
    throw new ApiError(400, 'Please provide check-in and check-out dates');
  }

  const isAvailable = await bookingService.checkAvailability(roomId, checkIn, checkOut);

  ApiResponse.success(res, { 
    available: isAvailable,
    room: roomId,
    checkIn,
    checkOut
  });
});

// @route   GET /api/v1/bookings/calendar
// @desc    Get bookings calendar
// @access  Private (Admin/Manager)
exports.getCalendar = catchAsync(async (req, res) => {
  const { startDate, endDate, roomId } = req.query;

  let query = {
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      { checkIn: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { checkOut: { $gte: new Date(startDate), $lte: new Date(endDate) } }
    ]
  };

  if (roomId) query.room = roomId;

  const bookings = await Booking.find(query)
    .populate('room', 'roomNumber type name')
    .populate('guest', 'name personalInfo')
    .select('checkIn checkOut status room guest bookingReference');

  ApiResponse.success(res, { bookings });
});
