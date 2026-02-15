const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');

// @route   GET /api/v1/feedback
// @desc    Get public feedback
// @access  Public
exports.getPublicFeedback = catchAsync(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  
  let query = { isPublic: true, status: 'approved' };
  if (type) query.type = type;

  const total = await Feedback.countDocuments(query);
  const feedback = await Feedback.find(query)
    .populate('guest', 'personalInfo.firstName personalInfo.lastName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, feedback, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Feedback retrieved successfully');
});

// @route   GET /api/v1/feedback/all
// @desc    Get all feedback (admin)
// @access  Private (Admin)
exports.getAllFeedback = catchAsync(async (req, res) => {
  const { status, type, flagged, page = 1, limit = 20 } = req.query;
  
  let query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (flagged === 'true') query.flagged = true;

  const total = await Feedback.countDocuments(query);
  const feedback = await Feedback.find(query)
    .populate('guest', 'personalInfo')
    .populate('booking', 'bookingReference')
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, feedback, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Feedback retrieved successfully');
});

// @route   POST /api/v1/feedback
// @desc    Submit feedback
// @access  Private
exports.submitFeedback = catchAsync(async (req, res) => {
  const { bookingId, type, ratings, review, photos } = req.body;

  const feedbackData = {
    booking: bookingId,
    guest: req.user._id,
    user: req.user._id,
    type: type || 'general',
    ratings,
    review,
    photos,
    status: 'pending',
    isPublic: false
  };

  const feedback = await Feedback.create(feedbackData);

  ApiResponse.created(res, { feedback }, 'Feedback submitted successfully. It will be reviewed shortly.');
});

// @route   GET /api/v1/feedback/:id
// @desc    Get feedback by ID
// @access  Private
exports.getFeedback = catchAsync(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('guest', 'personalInfo')
    .populate('booking', 'bookingReference')
    .populate('user', 'name')
    .populate('response.respondedBy', 'name');

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  ApiResponse.success(res, { feedback });
});

// @route   POST /api/v1/feedback/:id/respond
// @desc    Respond to feedback (admin)
// @access  Private (Admin)
exports.respondToFeedback = catchAsync(async (req, res) => {
  const { response } = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    {
      response: {
        text: response,
        respondedBy: req.user._id,
        respondedAt: new Date()
      },
      status: 'approved'
    },
    { new: true }
  ).populate('response.respondedBy', 'name');

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  ApiResponse.success(res, { feedback }, 'Response added successfully');
});

// @route   POST /api/v1/feedback/:id/approve
// @desc    Approve feedback
// @access  Private (Admin)
exports.approveFeedback = catchAsync(async (req, res) => {
  const { isPublic } = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'approved',
      isPublic: isPublic !== false
    },
    { new: true }
  );

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  ApiResponse.success(res, { feedback }, 'Feedback approved');
});

// @route   POST /api/v1/feedback/:id/reject
// @desc    Reject feedback
// @access  Private (Admin)
exports.rejectFeedback = catchAsync(async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  ApiResponse.success(res, { feedback }, 'Feedback rejected');
});

// @route   POST /api/v1/feedback/:id/flag
// @desc    Flag feedback
// @access  Private
exports.flagFeedback = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { 
      flagged: true,
      flagReason: reason
    },
    { new: true }
  );

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  ApiResponse.success(res, { feedback }, 'Feedback flagged');
});

// @route   POST /api/v1/feedback/:id/helpful
// @desc    Mark feedback as helpful
// @access  Private
exports.markHelpful = catchAsync(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  // Check if already marked
  if (feedback.helpful.users.includes(req.user._id)) {
    throw new ApiError(400, 'You already marked this as helpful');
  }

  feedback.helpful.count += 1;
  feedback.helpful.users.push(req.user._id);
  await feedback.save();

  ApiResponse.success(res, { helpful: feedback.helpful.count });
});

// @route   GET /api/v1/feedback/stats
// @desc    Get feedback statistics
// @access  Private (Admin)
exports.getStats = catchAsync(async (req, res) => {
  const total = await Feedback.countDocuments();
  const byStatus = await Feedback.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const byType = await Feedback.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const avgRatings = await Feedback.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: null,
        overall: { $avg: '$ratings.overall' },
        cleanliness: { $avg: '$ratings.cleanliness' },
        service: { $avg: '$ratings.service' },
        valueForMoney: { $avg: '$ratings.valueForMoney' }
      }
    }
  ]);

  ApiResponse.success(res, {
    total,
    byStatus,
    byType,
    averageRatings: avgRatings[0] || {}
  });
});
