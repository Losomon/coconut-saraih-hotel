const Room = require('../models/Room');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const pricingService = require('../services/pricing.service');
const availabilityService = require('../services/availability.service');

// @route   GET /api/v1/rooms
// @desc    Get all rooms with filters
// @access  Public
exports.getAllRooms = catchAsync(async (req, res) => {
  const { 
    type, 
    checkIn, 
    checkOut, 
    guests, 
    minPrice, 
    maxPrice, 
    amenities,
    page = 1, 
    limit = 20,
    sort = 'price',
    order = 'asc'
  } = req.query;

  let query = { isActive: true };

  // Filter by room type
  if (type) query.type = type;

  // Filter by price range
  if (minPrice || maxPrice) {
    query['price.base'] = {};
    if (minPrice) query['price.base'].$gte = parseFloat(minPrice);
    if (maxPrice) query['price.base'].$lte = parseFloat(maxPrice);
  }

  // Filter by amenities
  if (amenities) {
    const amenitiesList = amenities.split(',');
    query.amenities = { $all: amenitiesList };
  }

  // Get total count
  const total = await Room.countDocuments(query);

  // Sort options
  const sortOptions = {};
  if (sort === 'price') {
    sortOptions['price.base'] = order === 'asc' ? 1 : -1;
  } else if (sort === 'name') {
    sortOptions.name = order === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  const rooms = await Room.find(query)
    .select('-maintenance -housekeeping')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // If dates provided, check availability for each room
  if (checkIn && checkOut) {
    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        const isAvailable = await availabilityService.checkRoomAvailability(
          room._id,
          checkIn,
          checkOut
        );
        const dynamicPrice = await pricingService.getDynamicPrice(room._id, checkIn, checkOut);
        return {
          ...room.toObject(),
          available: isAvailable,
          price: {
            base: room.price.base,
            current: dynamicPrice
          }
        };
      })
    );

    return ApiResponse.paginated(res, roomsWithAvailability, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Rooms retrieved successfully');
  }

  ApiResponse.paginated(res, rooms, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Rooms retrieved successfully');
});

// @route   GET /api/v1/rooms/:id
// @desc    Get room by ID
// @access  Public
exports.getRoom = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('maintenance.cleanedBy', 'name');
  
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  // Get dynamic pricing
  const { checkIn, checkOut } = req.query;
  let dynamicPrice = room.price.base;
  
  if (checkIn && checkOut) {
    dynamicPrice = await pricingService.getDynamicPrice(room._id, checkIn, checkOut);
  }

  const roomWithPrice = {
    ...room.toObject(),
    price: {
      base: room.price.base,
      current: dynamicPrice
    }
  };

  ApiResponse.success(res, { room: roomWithPrice });
});

// @route   POST /api/v1/rooms
// @desc    Create new room
// @access  Private (Admin)
exports.createRoom = catchAsync(async (req, res) => {
  const roomData = req.body;
  
  // Check if room number already exists
  const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
  if (existingRoom) {
    throw new ApiError(400, 'Room number already exists');
  }

  const room = await Room.create(roomData);
  
  ApiResponse.created(res, { room }, 'Room created successfully');
});

// @route   PUT /api/v1/rooms/:id
// @desc    Update room
// @access  Private (Admin)
exports.updateRoom = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id);
  
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  // Don't allow changing room number if has active bookings
  if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
    const activeBookings = await Booking.findOne({
      room: room._id,
      status: { $in: ['confirmed', 'checked-in'] }
    });
    
    if (activeBookings) {
      throw new ApiError(400, 'Cannot change room number with active bookings');
    }
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  ApiResponse.success(res, { room: updatedRoom }, 'Room updated successfully');
});

// @route   DELETE /api/v1/rooms/:id
// @desc    Delete (deactivate) room
// @access  Private (Admin)
exports.deleteRoom = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id);
  
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  // Check for active bookings
  const activeBookings = await Booking.findOne({
    room: room._id,
    status: { $in: ['confirmed', 'checked-in'] }
  });

  if (activeBookings) {
    throw new ApiError(400, 'Cannot delete room with active bookings');
  }

  // Soft delete
  room.isActive = false;
  await room.save();

  ApiResponse.success(res, null, 'Room deleted successfully');
});

// @route   GET /api/v1/rooms/:id/availability
// @desc    Check room availability
// @access  Public
exports.checkAvailability = catchAsync(async (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    throw new ApiError(400, 'Please provide check-in and check-out dates');
  }

  const isAvailable = await availabilityService.checkRoomAvailability(
    req.params.id,
    checkIn,
    checkOut
  );

  // Get unavailable dates
  const unavailableDates = await availabilityService.getUnavailableDates(
    req.params.id,
    checkIn,
    checkOut
  );

  ApiResponse.success(res, {
    available: isAvailable,
    room: req.params.id,
    checkIn,
    checkOut,
    unavailableDates
  });
});

// @route   PATCH /api/v1/rooms/:id/status
// @desc    Update room status
// @access  Private (Staff/Admin)
exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'occupied', 'maintenance', 'cleaning'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  ApiResponse.success(res, { room }, `Room status updated to ${status}`);
});

// @route   GET /api/v1/rooms/types
// @desc    Get room types
// @access  Public
exports.getRoomTypes = catchAsync(async (req, res) => {
  const types = await Room.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        minPrice: { $min: '$price.base' },
        maxPrice: { $max: '$price.base' },
        avgPrice: { $avg: '$price.base' }
      }
    }
  ]);

  ApiResponse.success(res, { types });
});

// @route   GET /api/v1/rooms/:id/pricing
// @desc    Get dynamic pricing
// @access  Public
exports.getPricing = catchAsync(async (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    throw new ApiError(400, 'Please provide check-in and check-out dates');
  }

  const pricing = await pricingService.calculateRoomPricing(
    req.params.id,
    checkIn,
    checkOut
  );

  ApiResponse.success(res, { pricing });
});

// @route   POST /api/v1/rooms/:id/housekeeping
// @desc    Update housekeeping status
// @access  Private (Staff)
exports.updateHousekeeping = catchAsync(async (req, res) => {
  const { status, notes } = req.body;

  const room = await Room.findById(req.params.id);
  
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  room.housekeeping = {
    lastCleaned: new Date(),
    cleanedBy: req.user._id,
    nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    notes
  };

  // If cleaned, set room to available
  if (status === 'cleaned') {
    room.status = 'available';
  }

  await room.save();

  ApiResponse.success(res, { room }, 'Housekeeping status updated');
});

// @route   POST /api/v1/rooms/:id/maintenance
// @desc    Report maintenance issue
// @access  Private (Staff)
exports.reportMaintenance = catchAsync(async (req, res) => {
  const { issue, priority } = req.body;

  const room = await Room.findById(req.params.id);
  
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  room.maintenance.push({
    issue,
    priority,
    reportedDate: new Date(),
    status: 'reported'
  });

  // Set room to maintenance if critical
  if (priority === 'critical') {
    room.status = 'maintenance';
  }

  await room.save();

  ApiResponse.success(res, { room }, 'Maintenance issue reported');
});

// @route   GET /api/v1/rooms/dashboard/stats
// @desc    Get room dashboard statistics
// @access  Private (Admin/Manager)
exports.getDashboardStats = catchAsync(async (req, res) => {
  const stats = await Room.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const typeStats = await Room.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price.base' }
      }
    }
  ]);

  const totalRooms = await Room.countDocuments({ isActive: true });
  const availableRooms = await Room.countDocuments({ status: 'available', isActive: true });
  const occupancyRate = ((totalRooms - availableRooms) / totalRooms) * 100;

  ApiResponse.success(res, {
    byStatus: stats,
    byType: typeStats,
    totalRooms,
    availableRooms,
    occupancyRate: Math.round(occupancyRate * 10) / 10
  });
});
