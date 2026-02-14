const SpaService = require('../models/SpaService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @route   GET /api/v1/spa/services
// @desc    Get all spa services
// @access  Public
exports.getAllServices = catchAsync(async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  
  let query = { isActive: true };
  if (category) query.category = category;

  const total = await SpaService.countDocuments(query);
  const services = await SpaService.find(query)
    .populate('therapist', 'name')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, services, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Spa services retrieved successfully');
});

// @route   GET /api/v1/spa/services/:id
// @desc    Get spa service by ID
// @access  Public
exports.getService = catchAsync(async (req, res) => {
  const service = await SpaService.findById(req.params.id)
    .populate('therapist', 'name');

  if (!service) {
    throw new ApiError(404, 'Spa service not found');
  }

  ApiResponse.success(res, { service });
});

// @route   POST /api/v1/spa/services
// @desc    Create spa service
// @access  Private (Admin)
exports.createService = catchAsync(async (req, res) => {
  const service = await SpaService.create(req.body);
  
  ApiResponse.created(res, { service }, 'Spa service created successfully');
});

// @route   PUT /api/v1/spa/services/:id
// @desc    Update spa service
// @access  Private (Admin)
exports.updateService = catchAsync(async (req, res) => {
  const service = await SpaService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!service) {
    throw new ApiError(404, 'Spa service not found');
  }

  ApiResponse.success(res, { service }, 'Spa service updated successfully');
});

// @route   GET /api/v1/spa/availability
// @desc    Check therapist availability
// @access  Public
exports.checkAvailability = catchAsync(async (req, res) => {
  const { date, therapistId } = req.query;

  const services = await SpaService.find({
    isActive: true,
    ...(therapistId && { therapist: therapistId })
  }).populate('therapist', 'name');

  // Check availability for each service
  const availability = services.map(service => {
    const dayAvailability = service.availability.find(a => 
      a.date.toDateString() === new Date(date).toDateString()
    );

    return {
      service: {
        id: service._id,
        name: service.name,
        duration: service.duration,
        price: service.price
      },
      therapist: service.therapist,
      slots: dayAvailability?.slots || [],
      available: dayAvailability?.slots.some(s => s.available) || false
    };
  });

  ApiResponse.success(res, { availability });
});

// @route   POST /api/v1/spa/bookings
// @desc    Book spa service
// @access  Private
exports.bookService = catchAsync(async (req, res) => {
  const { serviceId, date, time, therapistId } = req.body;

  const service = await SpaService.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Spa service not found');
  }

  // Find or create availability for date
  let dayAvailability = service.availability.find(a => 
    a.date.toDateString() === new Date(date).toDateString()
  );

  if (!dayAvailability) {
    dayAvailability = {
      date: new Date(date),
      slots: [
        { time: '09:00', available: true, bookedBy: null },
        { time: '10:00', available: true, bookedBy: null },
        { time: '11:00', available: true, bookedBy: null },
        { time: '12:00', available: true, bookedBy: null },
        { time: '14:00', available: true, bookedBy: null },
        { time: '15:00', available: true, bookedBy: null },
        { time: '16:00', available: true, bookedBy: null },
        { time: '17:00', available: true, bookedBy: null }
      ]
    };
    service.availability.push(dayAvailability);
  }

  // Find slot
  const slot = dayAvailability.slots.find(s => s.time === time);
  if (!slot || !slot.available) {
    throw new ApiError(400, 'Time slot not available');
  }

  // Book slot
  slot.available = false;
  slot.bookedBy = req.user._id;
  await service.save();

  ApiResponse.created(res, {
    service: service._id,
    date,
    time,
    duration: service.duration,
    price: service.price
  }, 'Spa service booked successfully');
});

// @route   GET /api/v1/spa/categories
// @desc    Get spa categories
// @access  Public
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await SpaService.aggregate([
    { $match: { isActive: true } },
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
