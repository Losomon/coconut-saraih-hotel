const Analytics = require('../models/Analytics');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../utils/catchAsync');

// @route   GET /api/v1/analytics/dashboard
// @desc    Get dashboard metrics
// @access  Private (Admin/Manager)
exports.getDashboard = catchAsync(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's bookings
  const todayBookings = await Booking.find({
    createdAt: { $gte: today, $lt: tomorrow }
  });

  // Get pending bookings
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

  // Get today's check-ins and check-outs
  const checkInsToday = await Booking.countDocuments({
    checkIn: { $gte: today, $lt: tomorrow }
  });
  
  const checkOutsToday = await Booking.countDocuments({
    checkOut: { $gte: today, $lt: tomorrow }
  });

  // Get in-house guests
  const inHouseGuests = await Booking.countDocuments({ status: 'checked-in' });

  // Calculate occupancy
  const totalRooms = await Room.countDocuments({ isActive: true });
  const occupiedRooms = await Room.countDocuments({ status: 'occupied', isActive: true });
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

  // Get revenue
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const monthlyPayments = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const todayPayments = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Get last month for comparison
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  
  const lastMonthPayments = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const monthlyRevenue = monthlyPayments[0]?.total || 0;
  const lastMonthRevenue = lastMonthPayments[0]?.total || 0;
  const revenueTrend = lastMonthRevenue > 0 
    ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) 
    : 0;

  ApiResponse.success(res, {
    bookings: {
      today: todayBookings.length,
      pending: pendingBookings,
      confirmed: confirmedBookings
    },
    guests: {
      checkingInToday: checkInsToday,
      checkingOutToday: checkOutsToday,
      inHouse: inHouseGuests
    },
    occupancy: {
      current: parseFloat(occupancyRate),
      totalRooms,
      occupiedRooms
    },
    revenue: {
      today: todayPayments[0]?.total || 0,
      month: monthlyRevenue,
      lastMonth: lastMonthRevenue,
      trend: parseFloat(revenueTrend)
    }
  });
});

// @route   GET /api/v1/analytics/occupancy
// @desc    Get occupancy reports
// @access  Private (Admin)
exports.getOccupancyReport = catchAsync(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const bookings = await Booking.find({
    status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
    checkIn: { $gte: new Date(startDate) },
    checkOut: { $lte: new Date(endDate) }
  });

  const totalRooms = await Room.countDocuments({ isActive: true });

  // Group by day/week/month
  const occupancy = {};
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => {
      const checkIn = new Date(b.checkIn).toISOString().split('T')[0];
      const checkOut = new Date(b.checkOut).toISOString().split('T')[0];
      return dateKey >= checkIn && dateKey < checkOut;
    });

    occupancy[dateKey] = {
      booked: dayBookings.length,
      available: totalRooms - dayBookings.length,
      occupancyRate: ((dayBookings.length / totalRooms) * 100).toFixed(1)
    };

    currentDate.setDate(currentDate.getDate() + 1);
  }

  ApiResponse.success(res, {
    period: { startDate, endDate },
    totalRooms,
    occupancy
  });
});

// @route   GET /api/v1/analytics/revenue
// @desc    Get revenue reports
// @access  Private (Admin)
exports.getRevenueReport = catchAsync(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const payments = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        byType: {
          $push: '$type'
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const total = payments.reduce((sum, p) => sum + p.total, 0);

  ApiResponse.success(res, {
    period: { startDate, endDate },
    total,
    breakdown: payments
  });
});

// @route   GET /api/v1/analytics/bookings
// @desc    Get booking analytics
// @access  Private (Admin)
exports.getBookingAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const bookings = await Booking.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const byStatus = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const bySource = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    }
  ]);

  const cancellationRate = bookings.length > 0
    ? ((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100).toFixed(1)
    : 0;

  ApiResponse.success(res, {
    total: bookings.length,
    byStatus,
    bySource,
    cancellationRate: parseFloat(cancellationRate)
  });
});

// @route   GET /api/v1/analytics/export
// @desc    Export analytics data
// @access  Private (Admin)
exports.exportData = catchAsync(async (req, res) => {
  const { startDate, endDate, type = 'bookings' } = req.query;

  let data;
  
  if (type === 'bookings') {
    data = await Booking.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate('room', 'roomNumber type')
      .populate('guest', 'personalInfo')
      .lean();
  } else if (type === 'payments') {
    data = await Payment.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate('booking', 'bookingReference')
      .lean();
  }

  ApiResponse.success(res, {
    data,
    count: data.length,
    exportUrl: `/api/v1/analytics/download/${type}?startDate=${startDate}&endDate=${endDate}`
  });
});
