const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Activity = require('../models/Activity');
const SpaService = require('../models/SpaService');

/**
 * Analytics Service - Reporting and analytics
 */
class AnalyticsService {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bookings
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Guests
    const checkInsToday = await Booking.countDocuments({
      checkIn: { $gte: today, $lt: tomorrow }
    });
    
    const checkOutsToday = await Booking.countDocuments({
      checkOut: { $gte: today, $lt: tomorrow }
    });

    const inHouseGuests = await Booking.countDocuments({ status: 'checked-in' });

    // Rooms
    const totalRooms = await Room.countDocuments({ isActive: true });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied', isActive: true });

    // Revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      bookings: {
        today: todayBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings
      },
      guests: {
        checkingInToday: checkInsToday,
        checkingOutToday: checkOutsToday,
        inHouse: inHouseGuests
      },
      occupancy: {
        current: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
        total: totalRooms,
        occupied: occupiedRooms,
        available: totalRooms - occupiedRooms
      },
      revenue: {
        month: monthlyRevenue[0]?.total || 0
      }
    };
  }

  /**
   * Get occupancy analytics
   */
  async getOccupancyAnalytics(startDate, endDate) {
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
      checkIn: { $lte: new Date(endDate) },
      checkOut: { $gte: new Date(startDate) }
    });

    const totalRooms = await Room.countDocuments({ isActive: true });

    const dailyOccupancy = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => {
        const checkIn = new Date(b.checkIn).toISOString().split('T')[0];
        const checkOut = new Date(b.checkOut).toISOString().split('T')[0];
        return dateStr >= checkIn && dateStr < checkOut;
      });

      dailyOccupancy.push({
        date: dateStr,
        booked: dayBookings.length,
        occupancyRate: ((dayBookings.length / totalRooms) * 100).toFixed(1)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyOccupancy;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(startDate, endDate) {
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
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = payments.reduce((sum, p) => sum + p.total, 0);

    return {
      total,
      breakdown: payments,
      averagePerDay: payments.length > 0 ? total / payments.length : 0
    };
  }

  /**
   * Get booking analytics
   */
  async getBookingAnalytics(startDate, endDate) {
    const bookings = await Booking.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const byStatus = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bySource = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

    return {
      total: bookings.length,
      cancelled: cancelledCount,
      cancellationRate: bookings.length > 0 ? ((cancelledCount / bookings.length) * 100).toFixed(1) : 0,
      byStatus,
      bySource
    };
  }

  /**
   * Get guest analytics
   */
  async getGuestAnalytics() {
    const totalGuests = await Guest.countDocuments();
    const newGuestsThisMonth = await Guest.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const topSpenders = await Guest.find()
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('personalInfo totalSpent bookingHistory');

    const loyaltyDistribution = await Guest.aggregate([
      { $match: { 'loyaltyProgram.tier': { $exists: true } } },
      { $group: { _id: '$loyaltyProgram.tier', count: { $sum: 1 } } }
    ]);

    return {
      totalGuests,
      newGuestsThisMonth,
      topSpenders,
      loyaltyDistribution
    };
  }

  /**
   * Get activity analytics
   */
  async getActivityAnalytics(startDate, endDate) {
    const activities = await Activity.find({ isActive: true });
    
    const activityStats = activities.map(activity => {
      const bookings = activity.bookings.filter(b => {
        const date = new Date(b.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      return {
        id: activity._id,
        name: activity.name,
        totalBookings: bookings.length,
        totalParticipants: bookings.reduce((sum, b) => sum + b.participants, 0)
      };
    });

    return activityStats;
  }

  /**
   * Get spa analytics
   */
  async getSpaAnalytics(startDate, endDate) {
    const services = await SpaService.find({ isActive: true });
    
    const serviceStats = services.map(service => {
      let totalBookings = 0;
      service.availability.forEach(day => {
        if (day.date >= new Date(startDate) && day.date <= new Date(endDate)) {
          totalBookings += day.slots.filter(s => !s.available).length;
        }
      });

      return {
        id: service._id,
        name: service.name,
        totalBookings,
        revenue: totalBookings * service.price
      };
    });

    return serviceStats;
  }

  /**
   * Calculate RevPAR
   */
  async calculateRevPAR(startDate, endDate) {
    const { getRevenueAnalytics } = require('./analytics.service');
    const revenueData = await this.getRevenueAnalytics(startDate, endDate);
    
    const totalRooms = await Room.countDocuments({ isActive: true });
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const availableRoomNights = totalRooms * days;
    
    return {
      revPAR: availableRoomNights > 0 ? revenueData.total / availableRoomNights : 0,
      totalRevenue: revenueData.total,
      availableRoomNights
    };
  }
}

module.exports = new AnalyticsService();
