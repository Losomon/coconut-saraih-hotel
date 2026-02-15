const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');
const bookingService = require('./booking.service');

// @route   GET /api/v1/activities
// @desc    Get all activities
// @access  Public
exports.getAllActivities = catchAsync(async (req, res) => {
  const { category, date, page = 1, limit = 20 } = req.query;
  
  let query = { isActive: true };
  
  if (category) query.category = category;

  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .select('-bookings')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, activities, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Activities retrieved successfully');
});

// @route   GET /api/v1/activities/:id
// @desc    Get activity by ID
// @access  Public
exports.getActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findById(req.params.id)
    .populate('bookings.booking');
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  ApiResponse.success(res, { activity });
});

// @route   POST /api/v1/activities
// @desc    Create new activity
// @access  Private (Admin)
exports.createActivity = catchAsync(async (req, res) => {
  const activity = await Activity.create(req.body);
  
  ApiResponse.created(res, { activity }, 'Activity created successfully');
});

// @route   PUT /api/v1/activities/:id
// @desc    Update activity
// @access  Private (Admin)
exports.updateActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  ApiResponse.success(res, { activity }, 'Activity updated successfully');
});

// @route   DELETE /api/v1/activities/:id
// @desc    Delete activity
// @access  Private (Admin)
exports.deleteActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  ApiResponse.success(res, null, 'Activity deleted successfully');
});

// @route   GET /api/v1/activities/:id/availability
// @desc    Check activity availability
// @access  Public
exports.checkAvailability = catchAsync(async (req, res) => {
  const { date, slot } = req.query;
  const { id } = req.params;

  const activity = await Activity.findById(id);
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  // Find the slot
  const slotInfo = activity.availability.slots.find(s => s.time === slot);
  if (!slotInfo) {
    throw new ApiError(400, 'Invalid time slot');
  }

  // Check existing bookings
  const existingBookings = activity.bookings.filter(b => 
    b.date.toDateString() === new Date(date).toDateString() &&
    b.slot === slot
  );

  const available = slotInfo.capacity - existingBookings.reduce((sum, b) => sum + b.participants, 0);

  ApiResponse.success(res, {
    activity: id,
    date,
    slot,
    capacity: slotInfo.capacity,
    booked: slotInfo.capacity - available,
    available
  });
});

// @route   POST /api/v1/activities/:id/book
// @desc    Book an activity
// @access  Private
exports.bookActivity = catchAsync(async (req, res) => {
  const { date, slot, participants, bookingId } = req.body;
  const { id: activityId } = req.params;

  const activity = await Activity.findById(activityId);
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  // Find slot
  const slotInfo = activity.availability.slots.find(s => s.time === slot);
  if (!slotInfo) {
    throw new ApiError(400, 'Invalid time slot');
  }

  // Calculate total price
  const totalParticipants = participants.adults + (participants.children || 0);
  const totalPrice = (activity.price.adult * participants.adults) + 
    (activity.price.child * (participants.children || 0));

  // Check availability
  const existingBookings = activity.bookings.filter(b => 
    b.date.toDateString() === new Date(date).toDateString() &&
    b.slot === slot
  );

  const booked = existingBookings.reduce((sum, b) => sum + b.participants, 0);
  if (booked + totalParticipants > slotInfo.capacity) {
    throw new ApiError(400, 'Not enough slots available');
  }

  // Add booking
  activity.bookings.push({
    booking: bookingId,
    date: new Date(date),
    slot,
    participants: totalParticipants
  });

  await activity.save();

  ApiResponse.created(res, {
    activity: activity._id,
    date,
    slot,
    participants,
    totalPrice,
    currency: activity.price.currency
  }, 'Activity booked successfully');
});

// @route   GET /api/v1/activities/categories
// @desc    Get activity categories
// @access  Public
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await Activity.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        minPrice: { $min: '$price.adult' },
        maxPrice: { $max: '$price.adult' }
      }
    }
  ]);

  ApiResponse.success(res, { categories });
});
