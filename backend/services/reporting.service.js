const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const Analytics = require('../models/Analytics');

/**
 * Reporting Service - Generate reports
 */
class ReportingService {
  /**
   * Generate daily report
   */
  async generateDailyReport(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [
      bookings,
      payments,
      checkIns,
      checkOuts
    ] = await Promise.all([
      Booking.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
      Payment.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
      Booking.find({ checkIn: { $gte: dayStart, $lte: dayEnd } }),
      Booking.find({ checkOut: { $gte: dayStart, $lte: dayEnd } })
    ]);

    const completedPayments = payments.filter(p => p.status === 'completed');

    return {
      date,
      bookings: {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length
      },
      revenue: {
        total: completedPayments.reduce((sum, p) => sum + p.amount, 0),
        count: completedPayments.length
      },
      guests: {
        checkIns: checkIns.length,
        checkOuts: checkOuts.length
      }
    };
  }

  /**
   * Generate monthly report
   */
  async generateMonthlyReport(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [bookings, payments, rooms] = await Promise.all([
      Booking.find({ createdAt: { $gte: startDate, $lte: endDate } }),
      Payment.find({ createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' }),
      Room.find({ isActive: true })
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRooms = rooms.length;
    const daysInMonth = new Date(year, month, 0).getDate();
    const occupiedRoomNights = bookings.reduce((sum, b) => {
      const nights = Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);

    return {
      period: { year, month },
      bookings: {
        total: bookings.length,
        byStatus: this.groupBy(bookings, 'status')
      },
      revenue: {
        total: totalRevenue,
        averagePerBooking: bookings.length > 0 ? totalRevenue / bookings.length : 0
      },
      occupancy: {
        totalRoomNights: totalRooms * daysInMonth,
        occupiedRoomNights,
        rate: ((occupiedRoomNights / (totalRooms * daysInMonth)) * 100).toFixed(1)
      }
    };
  }

  /**
   * Generate occupancy report
   */
  async generateOccupancyReport(startDate, endDate) {
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
      checkIn: { $lte: new Date(endDate) },
      checkOut: { $gte: new Date(startDate) }
    });

    const rooms = await Room.find({ isActive: true });
    const totalRooms = rooms.length;

    const dailyData = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => {
        const checkIn = new Date(b.checkIn).toISOString().split('T')[0];
        const checkOut = new Date(b.checkOut).toISOString().split('T')[0];
        return dateStr >= checkIn && dateStr < checkOut;
      });

      dailyData.push({
        date: dateStr,
        occupied: dayBookings.length,
        available: totalRooms - dayBookings.length,
        occupancyRate: ((dayBookings.length / totalRooms) * 100).toFixed(1)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      startDate,
      endDate,
      totalRooms,
      dailyData,
      averageOccupancy: dailyData.reduce((sum, d) => sum + parseFloat(d.occupancyRate), 0) / dailyData.length
    };
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(startDate, endDate, groupBy = 'day') {
    const payments = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          byType: { $push: '$type' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = payments.reduce((sum, p) => sum + p.total, 0);

    return {
      startDate,
      endDate,
      groupBy,
      total,
      breakdown: payments
    };
  }

  /**
   * Generate guest report
   */
  async generateGuestReport(startDate, endDate) {
    const guests = await Guest.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const bookings = await Booking.find({
      guest: { $in: guests.map(g => g._id) },
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    return {
      newGuests: guests.length,
      totalBookings: bookings.length,
      totalSpent: guests.reduce((sum, g) => sum + (g.totalSpent || 0), 0),
      averageSpent: guests.length > 0 
        ? guests.reduce((sum, g) => sum + (g.totalSpent || 0), 0) / guests.length 
        : 0
    };
  }

  /**
   * Export to Excel
   */
  async exportToExcel(data, filename) {
    // Would use exceljs library
    return { filename, data };
  }

  /**
   * Export to PDF
   */
  async exportToPDF(data, filename) {
    // Would use pdfkit library
    return { filename, data };
  }

  // Helper to group by key
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }
}

module.exports = new ReportingService();
