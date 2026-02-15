const Staff = require('../models/Staff');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');

// @route   GET /api/v1/staff
// @desc    Get all staff members
// @access  Private (Admin)
exports.getAllStaff = catchAsync(async (req, res) => {
  const { department, shift, isActive, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (department) query.department = department;
  if (shift) query.shift = shift;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const total = await Staff.countDocuments(query);
  const staff = await Staff.find(query)
    .populate('user', 'name email role profile.phone')
    .populate('schedule.cleanedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, staff, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Staff retrieved successfully');
});

// @route   GET /api/v1/staff/:id
// @desc    Get staff member by ID
// @access  Private (Admin)
exports.getStaff = catchAsync(async (req, res) => {
  const staff = await Staff.findById(req.params.id)
    .populate('user', 'name email role profile.phone');

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  ApiResponse.success(res, { staff });
});

// @route   POST /api/v1/staff
// @desc    Create new staff member
// @access  Private (Admin)
exports.createStaff = catchAsync(async (req, res) => {
  const { userId, employeeId, department, position, shift, schedule, salary } = req.body;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if employee ID already exists
  const existingStaff = await Staff.findOne({ employeeId });
  if (existingStaff) {
    throw new ApiError(400, 'Employee ID already exists');
  }

  // Update user role
  user.role = 'staff';
  await user.save();

  const staff = await Staff.create({
    user: userId,
    employeeId,
    department,
    position,
    shift,
    schedule,
    salary,
    joinDate: new Date()
  });

  await staff.populate('user', 'name email role');

  ApiResponse.created(res, { staff }, 'Staff member created successfully');
});

// @route   PUT /api/v1/staff/:id
// @desc    Update staff member
// @access  Private (Admin)
exports.updateStaff = catchAsync(async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email role');

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  ApiResponse.success(res, { staff }, 'Staff member updated successfully');
});

// @route   DELETE /api/v1/staff/:id
// @desc    Deactivate staff member
// @access  Private (Admin)
exports.deleteStaff = catchAsync(async (req, res) => {
  const { terminationDate, reason } = req.body;

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
      terminationDate: terminationDate || new Date(),
      notes: reason
    },
    { new: true }
  );

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Update user role
  await User.findByIdAndUpdate(staff.user, { role: 'guest' });

  ApiResponse.success(res, null, 'Staff member deactivated successfully');
});

// @route   GET /api/v1/staff/:id/schedule
// @desc    Get staff schedule
// @access  Private
exports.getSchedule = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  // Get schedule with date range filter
  let schedule = staff.schedule;
  
  if (startDate && endDate) {
    schedule = schedule.filter(s => {
      const day = new Date(s.date);
      return day >= new Date(startDate) && day <= new Date(endDate);
    });
  }

  ApiResponse.success(res, { schedule });
});

// @route   POST /api/v1/staff/:id/leave
// @desc    Request leave
// @access  Private
exports.requestLeave = catchAsync(async (req, res) => {
  const { startDate, endDate, type, reason } = req.body;

  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  staff.leaves.push({
    type,
    startDate,
    endDate,
    reason,
    status: 'pending'
  });

  await staff.save();

  ApiResponse.success(res, { staff }, 'Leave request submitted successfully');
});

// @route   POST /api/v1/staff/:id/leave/:leaveId/approve
// @desc    Approve leave request
// @access  Private (Admin/Manager)
exports.approveLeave = catchAsync(async (req, res) => {
  const { approved } = req.body;

  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const leave = staff.leaves.id(req.params.leaveId);
  if (!leave) {
    throw new ApiError(404, 'Leave request not found');
  }

  leave.status = approved ? 'approved' : 'rejected';
  await staff.save();

  ApiResponse.success(res, { staff }, `Leave request ${approved ? 'approved' : 'rejected'}`);
});

// @route   GET /api/v1/staff/department/:department
// @desc    Get staff by department
// @access  Private
exports.getByDepartment = catchAsync(async (req, res) => {
  const staff = await Staff.find({ 
    department: req.params.department,
    isActive: true 
  }).populate('user', 'name email');

  ApiResponse.success(res, { staff });
});

// @route   GET /api/v1/staff/shift/:shift
// @desc    Get staff by shift
// @access  Private
exports.getByShift = catchAsync(async (req, res) => {
  const staff = await Staff.find({ 
    shift: req.params.shift,
    isActive: true 
  }).populate('user', 'name email');

  ApiResponse.success(res, { staff });
});

// @route   GET /api/v1/staff/stats
// @desc    Get staff statistics
// @access  Private (Admin)
exports.getStats = catchAsync(async (req, res) => {
  const totalStaff = await Staff.countDocuments({ isActive: true });
  
  const byDepartment = await Staff.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    }
  ]);

  const byShift = await Staff.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$shift',
        count: { $sum: 1 }
      }
    }
  ]);

  ApiResponse.success(res, {
    totalStaff,
    byDepartment,
    byShift
  });
});
