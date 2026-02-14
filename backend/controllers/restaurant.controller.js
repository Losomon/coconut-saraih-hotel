const MenuItem = require('../models/MenuItem');
const TableReservation = require('../models/TableReservation');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// ============================================
// MENU MANAGEMENT
// ============================================

// @route   GET /api/v1/restaurant/menu
// @desc    Get all menu items
// @access  Public
exports.getMenu = catchAsync(async (req, res) => {
  const { category, dietary, available, search, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (category) query.category = category;
  if (available !== undefined) query.isAvailable = available === 'true';
  if (dietary) query.dietary = { $in: dietary.split(',') };
  if (search) {
    query.$or = [
      { 'name.en': { $regex: search, $options: 'i' } },
      { 'name.sw': { $regex: search, $options: 'i' } },
      { 'name.fr': { $regex: search, $options: 'i' } }
    ];
  }

  const total = await MenuItem.countDocuments(query);
  const menuItems = await MenuItem.find(query)
    .sort({ category: 1, 'name.en': 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, menuItems, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Menu retrieved successfully');
});

// @route   GET /api/v1/restaurant/menu/:id
// @desc    Get menu item by ID
// @access  Public
exports.getMenuItem = catchAsync(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  ApiResponse.success(res, { menuItem });
});

// @route   POST /api/v1/restaurant/menu
// @desc    Create menu item
// @access  Private (Admin)
exports.createMenuItem = catchAsync(async (req, res) => {
  const menuItem = await MenuItem.create(req.body);

  ApiResponse.created(res, { menuItem }, 'Menu item created successfully');
});

// @route   PUT /api/v1/restaurant/menu/:id
// @desc    Update menu item
// @access  Private (Admin)
exports.updateMenuItem = catchAsync(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  ApiResponse.success(res, { menuItem }, 'Menu item updated successfully');
});

// @route   DELETE /api/v1/restaurant/menu/:id
// @desc    Delete menu item
// @access  Private (Admin)
exports.deleteMenuItem = catchAsync(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  ApiResponse.success(res, null, 'Menu item deleted successfully');
});

// @route   PATCH /api/v1/restaurant/menu/:id/availability
// @desc    Toggle menu item availability
// @access  Private (Staff)
exports.toggleAvailability = catchAsync(async (req, res) => {
  const { isAvailable } = req.body;

  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { isAvailable },
    { new: true }
  );

  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  ApiResponse.success(res, { menuItem }, `Menu item is now ${isAvailable ? 'available' : 'unavailable'}`);
});

// @route   GET /api/v1/restaurant/menu/categories
// @desc    Get menu categories
// @access  Public
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await MenuItem.aggregate([
    { $match: { isAvailable: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  ApiResponse.success(res, { categories });
});

// ============================================
// TABLE RESERVATIONS
// ============================================

// @route   GET /api/v1/restaurant/reservations
// @desc    Get all reservations
// @access  Private (Admin/Staff)
exports.getAllReservations = catchAsync(async (req, res) => {
  const { status, date, startDate, endDate, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (status) query.status = status;
  if (date) query.date = { $eq: new Date(date) };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const total = await TableReservation.countDocuments(query);
  const reservations = await TableReservation.find(query)
    .populate('guest', 'personalInfo')
    .populate('user', 'name email')
    .populate('preOrder.menuItem', 'name price')
    .sort({ date: 1, time: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, reservations, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Reservations retrieved successfully');
});

// @route   GET /api/v1/restaurant/reservations/my
// @desc    Get current user's reservations
// @access  Private
exports.getMyReservations = catchAsync(async (req, res) => {
  const reservations = await TableReservation.find({ user: req.user._id })
    .populate('preOrderReservation.find({ user.menuItem', 'name price')
    .sort({ date: -1 });

  ApiResponse.success(res, { reservations });
});

// @route   GET /api/v1/restaurant/reservations/:id
// @desc    Get reservation by ID
// @access  Private
exports.getReservation = catchAsync(async (req, res) => {
  const reservation = await TableReservation.findById(req.params.id)
    .populate('guest', 'personalInfo')
    .populate('user', 'name email')
    .populate('preOrder.menuItem', 'name price');

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  ApiResponse.success(res, { reservation });
});

// @route   POST /api/v1/restaurant/reservations
// @desc    Make table reservation
// @access  Public
exports.createReservation = catchAsync(async (req, res) => {
  const { date, time, partySize, tableNumber, specialRequests, occasion, preOrder } = req.body;

  // Check table availability
  const existingReservation = await TableReservation.findOne({
    date: new Date(date),
    time,
    tableNumber,
    status: { $nin: ['cancelled', 'no-show', 'completed'] }
  });

  if (existingReservation) {
    throw new ApiError(400, 'Table is not available for the selected time');
  }

  const reservationData = {
    guest: req.user?._id || null,
    user: req.user?._id,
    date,
    time,
    partySize,
    tableNumber,
    specialRequests,
    occasion,
    preOrder: preOrder || [],
    status: 'pending'
  };

  const reservation = await TableReservation.create(reservationData);

  ApiResponse.created(res, { reservation }, 'Table reserved successfully');
});

// @route   PUT /api/v1/restaurant/reservations/:id
// @desc    Update reservation
// @access  Private
exports.updateReservation = catchAsync(async (req, res) => {
  const reservation = await TableReservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  // Only allow guest to update their own reservation
  const isOwner = reservation.user?.toString() === req.user?._id?.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user?.role);

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to update this reservation');
  }

  // Guests can only update certain fields
  if (req.user?.role === 'guest') {
    const allowedUpdates = ['specialRequests', 'partySize', 'preOrder'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(u => allowedUpdates.includes(u));
    
    if (!isValidUpdate) {
      throw new ApiError(400, 'Invalid updates');
    }
  }

  const updatedReservation = await TableReservation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('preOrder.menuItem', 'name price');

  ApiResponse.success(res, { reservation: updatedReservation }, 'Reservation updated successfully');
});

// @route   PATCH /api/v1/restaurant/reservations/:id/status
// @desc    Update reservation status
// @access  Private (Staff)
exports.updateReservationStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const updateData = { status };
  
  // Set seated/completed times
  if (status === 'seated') {
    updateData.seatedAt = new Date();
  } else if (status === 'completed') {
    updateData.leftAt = new Date();
  }

  const reservation = await TableReservation.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  ApiResponse.success(res, { reservation }, `Reservation status updated to ${status}`);
});

// @route   DELETE /api/v1/restaurant/reservations/:id
// @desc    Cancel reservation
// @access  Private
exports.cancelReservation = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const reservation = await TableReservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  // Check authorization
  const isOwner = reservation.user?.toString() === req.user?._id?.toString();
  const isAdmin = ['admin', 'manager'].includes(req.user?.role);

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to cancel this reservation');
  }

  reservation.status = 'cancelled';
  reservation.notes = reason;
  await reservation.save();

  ApiResponse.success(res, { reservation }, 'Reservation cancelled successfully');
});

// @route   GET /api/v1/restaurant/reservations/availability
// @desc    Check table availability
// @access  Public
exports.checkAvailability = catchAsync(async (req, res) => {
  const { date, time, partySize } = req.query;

  // Get all reservations for the date and time
  const reservations = await TableReservation.find({
    date: new Date(date),
    time,
    status: { $nin: ['cancelled', 'no-show', 'completed'] }
  });

  // Group by table number
  const bookedTables = reservations.map(r => r.tableNumber);

  // Available tables (assuming tables 1-20)
  const allTables = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
  const availableTables = allTables.filter(t => !bookedTables.includes(t));

  ApiResponse.success(res, {
    date,
    time,
    partySize,
    bookedTables,
    availableTables,
    totalAvailable: availableTables.length
  });
});

// @route   GET /api/v1/restaurant/reservations/calendar
// @desc    Get reservations calendar
// @access  Private (Admin/Staff)
exports.getCalendar = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const reservations = await TableReservation.find({
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: { $nin: ['cancelled', 'no-show'] }
  })
    .populate('guest', 'personalInfo.firstName personalInfo.lastName')
    .select('date time partySize tableNumber status guest')
    .sort({ date: 1, time: 1 });

  ApiResponse.success(res, { reservations });
});

// @route   GET /api/v1/restaurant/stats
// @desc    Get restaurant statistics
// @access  Private (Admin)
exports.getStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const reservationStats = await TableReservation.aggregate([
    { $match: { date: dateFilter } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalGuests: { $sum: '$partySize' }
      }
    }
  ]);

  const todayReservations = await TableReservation.countDocuments({
    date: { $eq: new Date() },
    status: { $in: ['confirmed', 'pending', 'seated'] }
  });

  const totalGuestsToday = await TableReservation.aggregate([
    {
      $match: {
        date: { $eq: new Date() },
        status: { $in: ['seated', 'completed'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$partySize' }
      }
    }
  ]);

  ApiResponse.success(res, {
    reservations: reservationStats,
    today: {
      reservations: todayReservations,
      expectedGuests: totalGuestsToday[0]?.total || 0
    }
  });
});
