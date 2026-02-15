const Event = require('../models/Event');
const EventHall = require('../models/EventHall');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');

// @route   GET /api/v1/events/halls
// @desc    Get available event halls
// @access  Public
exports.getHalls = catchAsync(async (req, res) => {
  const { capacity, date, startTime, endTime } = req.query;
  
  let query = { isActive: true };
  
  if (capacity) {
    query.minCapacity = { $lte: parseInt(capacity) };
    query.maxCapacity = { $gte: parseInt(capacity) };
  }

  const halls = await EventHall.find(query);

  // If date provided, check availability
  if (date) {
    const eventsOnDate = await Event.find({
      hall: { $in: halls.map(h => h._id) },
      date: new Date(date),
      status: { $in: ['confirmed', 'in-progress'] }
    });

    const bookedHallIds = eventsOnDate.map(e => e.hall.toString());
    const availableHalls = halls.filter(h => !bookedHallIds.includes(h._id.toString()));

    return ApiResponse.success(res, { 
      halls: availableHalls,
      totalAvailable: availableHalls.length 
    });
  }

  ApiResponse.success(res, { halls, totalAvailable: halls.length });
});

// @route   GET /api/v1/events/halls/:id
// @desc    Get hall details
// @access  Public
exports.getHall = catchAsync(async (req, res) => {
  const hall = await EventHall.findById(req.params.id);

  if (!hall) {
    throw new ApiError(404, 'Event hall not found');
  }

  ApiResponse.success(res, { hall });
});

// @route   POST /api/v1/events/inquiry
// @desc    Submit event inquiry
// @access  Public
exports.submitInquiry = catchAsync(async (req, res) => {
  const { eventName, eventType, expectedGuests, date, organizer } = req.body;

  const event = await Event.create({
    eventName,
    eventType,
    expectedGuests,
    date,
    organizer,
    status: 'inquiry'
  });

  ApiResponse.created(res, { event }, 'Inquiry submitted successfully. We will contact you soon.');
});

// @route   POST /api/v1/events
// @desc    Create event booking
// @access  Private
exports.createEvent = catchAsync(async (req, res) => {
  const { 
    eventName, eventType, hall, date, startTime, endTime,
    expectedGuests, services, pricing 
  } = req.body;

  // Check hall availability
  const existingEvent = await Event.findOne({
    hall,
    date: new Date(date),
    status: { $in: ['confirmed', 'in-progress'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (existingEvent) {
    throw new ApiError(400, 'Hall is not available for the selected time');
  }

  const event = await Event.create({
    eventName,
    eventType,
    hall,
    date,
    startTime,
    endTime,
    expectedGuests,
    services,
    pricing,
    status: 'pending'
  });

  await event.populate('hall', 'name capacity');

  ApiResponse.created(res, { event }, 'Event booking created successfully');
});

// @route   GET /api/v1/events
// @desc    Get all events
// @access  Private (Admin)
exports.getAllEvents = catchAsync(async (req, res) => {
  const { status, eventType, startDate, endDate, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (status) query.status = status;
  if (eventType) query.eventType = eventType;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate('hall', 'name')
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, events, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Events retrieved successfully');
});

// @route   GET /api/v1/events/:id
// @desc    Get event details
// @access  Private
exports.getEvent = catchAsync(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('hall')
    .populate('payment');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  ApiResponse.success(res, { event });
});

// @route   PUT /api/v1/events/:id
// @desc    Update event
// @access  Private (Admin)
exports.updateEvent = catchAsync(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('hall');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  ApiResponse.success(res, { event }, 'Event updated successfully');
});

// @route   PATCH /api/v1/events/:id/status
// @desc    Update event status
// @access  Private (Admin)
exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['inquiry', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('hall');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  ApiResponse.success(res, { event }, `Event status updated to ${status}`);
});

// @route   DELETE /api/v1/events/:id
// @desc    Cancel event
// @access  Private
exports.cancelEvent = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'cancelled',
      cancellationReason: reason
    },
    { new: true }
  );

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  ApiResponse.success(res, { event }, 'Event cancelled successfully');
});

// @route   GET /api/v1/events/calendar
// @desc    Get events calendar
// @access  Private (Admin)
exports.getCalendar = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const events = await Event.find({
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: { $in: ['confirmed', 'in-progress'] }
  })
    .populate('hall', 'name')
    .select('eventName eventType date startTime endTime hall status');

  ApiResponse.success(res, { events });
});

// @route   POST /api/v1/events/halls
// @desc    Create event hall
// @access  Private (Admin)
exports.createHall = catchAsync(async (req, res) => {
  const hall = await EventHall.create(req.body);

  ApiResponse.created(res, { hall }, 'Event hall created successfully');
});

// @route   PUT /api/v1/events/halls/:id
// @desc    Update event hall
// @access  Private (Admin)
exports.updateHall = catchAsync(async (req, res) => {
  const hall = await EventHall.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!hall) {
    throw new ApiError(404, 'Event hall not found');
  }

  ApiResponse.success(res, { hall }, 'Event hall updated successfully');
});
