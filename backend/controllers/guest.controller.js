const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');

// @route   GET /api/v1/guests
// @desc    Get all guests
// @access  Private (Admin/Manager)
exports.getAllGuests = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (search) {
    query.$or = [
      { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
      { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
      { 'personalInfo.email': { $regex: search, $options: 'i' } },
      { 'personalInfo.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Guest.countDocuments(query);
  const guests = await Guest.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, guests, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Guests retrieved successfully');
});

// @route   GET /api/v1/guests/profile
// @desc    Get current guest profile
// @access  Private
exports.getProfile = catchAsync(async (req, res) => {
  const guest = await Guest.findOne({ user: req.user._id })
    .populate('bookingHistory');

  if (!guest) {
    throw new ApiError(404, 'Guest profile not found');
  }

  ApiResponse.success(res, { guest });
});

// @route   GET /api/v1/guests/:id
// @desc    Get guest by ID
// @access  Private (Admin/Staff)
exports.getGuest = catchAsync(async (req, res) => {
  const guest = await Guest.findById(req.params.id)
    .populate('user', 'name email role')
    .populate('bookingHistory');

  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  ApiResponse.success(res, { guest });
});

// @route   POST /api/v1/guests
// @desc    Create guest profile
// @access  Private
exports.createGuest = catchAsync(async (req, res) => {
  const guestData = {
    ...req.body,
    user: req.user._id
  };

  // Check if guest already exists
  const existingGuest = await Guest.findOne({ user: req.user._id });
  if (existingGuest) {
    throw new ApiError(400, 'Guest profile already exists');
  }

  const guest = await Guest.create(guestData);

  ApiResponse.created(res, { guest }, 'Guest profile created successfully');
});

// @route   PUT /api/v1/guests/profile
// @desc    Update current guest profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res) => {
  const guest = await Guest.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!guest) {
    throw new ApiError(404, 'Guest profile not found');
  }

  ApiResponse.success(res, { guest }, 'Profile updated successfully');
});

// @route   PUT /api/v1/guests/:id
// @desc    Update guest
// @access  Private (Admin)
exports.updateGuest = catchAsync(async (req, res) => {
  const guest = await Guest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  ApiResponse.success(res, { guest }, 'Guest updated successfully');
});

// @route   GET /api/v1/guests/:id/bookings
// @desc    Get guest booking history
// @access  Private
exports.getBookingHistory = catchAsync(async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  
  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  const bookings = await Booking.find({ guest: req.params.id })
    .populate('room', 'roomNumber type name')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, { bookings });
});

// @route   GET /api/v1/guests/loyalty
// @desc    Get loyalty program details
// @access  Private
exports.getLoyalty = catchAsync(async (req, res) => {
  const guest = await Guest.findOne({ user: req.user._id });
  
  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  const { loyaltyProgram } = guest;

  // Calculate points based on total spent
  const pointsEarned = Math.floor(guest.totalSpent / 10); // 1 point per $10 spent

  // Determine tier
  let tier = 'bronze';
  if (pointsEarned >= 10000) tier = 'platinum';
  else if (pointsEarned >= 5000) tier = 'gold';
  else if (pointsEarned >= 2000) tier = 'silver';

  ApiResponse.success(res, {
    loyalty: {
      ...loyaltyProgram,
      points: pointsEarned,
      tier,
      totalSpent: guest.totalSpent,
      totalBookings: guest.bookingHistory?.length || 0
    }
  });
});

// @route   POST /api/v1/guests/:id/blacklist
// @desc    Blacklist a guest
// @access  Private (Admin)
exports.blacklistGuest = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const guest = await Guest.findByIdAndUpdate(
    req.params.id,
    {
      blacklisted: true,
      blacklistReason: reason
    },
    { new: true }
  );

  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  ApiResponse.success(res, { guest }, 'Guest blacklisted successfully');
});

// @route   POST /api/v1/guests/:id/remove-blacklist
// @desc    Remove guest from blacklist
// @access  Private (Admin)
exports.removeBlacklist = catchAsync(async (req, res) => {
  const guest = await Guest.findByIdAndUpdate(
    req.params.id,
    {
      blacklisted: false,
      blacklistReason: null
    },
    { new: true }
  );

  if (!guest) {
    throw new ApiError(404, 'Guest not found');
  }

  ApiResponse.success(res, { guest }, 'Guest removed from blacklist');
});

// @route   GET /api/v1/guests/stats
// @desc    Get guest statistics
// @access  Private (Admin)
exports.getStats = catchAsync(async (req, res) => {
  const totalGuests = await Guest.countDocuments();
  const blacklistedGuests = await Guest.countDocuments({ blacklisted: true });
  
  const loyaltyStats = await Guest.aggregate([
    { $match: { 'loyaltyProgram.tier': { $exists: true } } },
    {
      $group: {
        _id: '$loyaltyProgram.tier',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalSpent = await Guest.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$totalSpent' },
        avg: { $avg: '$totalSpent' }
      }
    }
  ]);

  ApiResponse.success(res, {
    totalGuests,
    blacklistedGuests,
    byTier: loyaltyStats,
    spending: {
      total: totalSpent[0]?.total || 0,
      average: Math.round(totalSpent[0]?.avg || 0)
    }
  });
});
