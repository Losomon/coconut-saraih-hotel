const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');

/**
 * Availability Service - Check and manage availability
 */
class AvailabilityService {
  /**
   * Check room availability
   */
  async checkRoomAvailability(roomId, checkIn, checkOut) {
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
        { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } },
        { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } }
      ]
    });

    return !existingBooking;
  }

  /**
   * Get unavailable dates for a room
   */
  async getUnavailableDates(roomId, startDate, endDate) {
    const bookings = await Booking.find({
      room: roomId,
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        { checkIn: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { checkOut: { $gte: new Date(startDate), $lte: new Date(endDate) } }
      ]
    }).select('checkIn checkOut');

    const unavailableDates = [];
    bookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      
      for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
        unavailableDates.push(new Date(d).toISOString().split('T')[0]);
      }
    });

    return [...new Set(unavailableDates)];
  }

  /**
   * Get available rooms for date range
   */
  async getAvailableRooms(checkIn, checkOut, filters = {}) {
    // Get all bookings in date range
    const bookings = await Booking.find({
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
        { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } },
        { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } }
      ]
    }).select('room');

    const bookedRoomIds = bookings.map(b => b.room);

    // Get available rooms
    let query = { 
      _id: { $nin: bookedRoomIds },
      isActive: true,
      status: 'available'
    };

    if (filters.type) query.type = filters.type;
    if (filters.guests) {
      query['capacity.adults'] = { $gte: filters.guests.adults || 1 };
    }

    const rooms = await Room.find(query);

    return rooms;
  }

  /**
   * Check activity availability
   */
  async checkActivityAvailability(activityId, date, slot, participants) {
    const activity = await Activity.findById(activityId);
    if (!activity) return { available: false, reason: 'Activity not found' };

    const slotInfo = activity.availability.slots.find(s => s.time === slot);
    if (!slotInfo) return { available: false, reason: 'Invalid slot' };

    const existingBookings = activity.bookings.filter(b => 
      b.date.toDateString() === new Date(date).toDateString() &&
      b.slot === slot
    );

    const booked = existingBookings.reduce((sum, b) => sum + b.participants, 0);
    const available = slotInfo.capacity - booked;

    if (available < participants) {
      return { available: false, reason: 'Not enough slots', available };
    }

    return { available: true, available };
  }

  /**
   * Get room availability calendar
   */
  async getRoomAvailabilityCalendar(roomId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await Booking.find({
      room: roomId,
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        { checkIn: { $gte: startDate, $lte: endDate } },
        { checkOut: { $gte: startDate, $lte: endDate } }
      ]
    }).select('checkIn checkOut');

    const calendar = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];

      const isBooked = bookings.some(b => {
        const checkIn = new Date(b.checkIn).toISOString().split('T')[0];
        const checkOut = new Date(b.checkOut).toISOString().split('T')[0];
        return dateStr >= checkIn && dateStr < checkOut;
      });

      calendar.push({
        date: dateStr,
        available: !isBooked,
        status: isBooked ? 'booked' : 'available'
      });
    }

    return calendar;
  }

  /**
   * Get real-time availability summary
   */
  async getAvailabilitySummary() {
    const totalRooms = await Room.countDocuments({ isActive: true });
    const availableRooms = await Room.countDocuments({ 
      status: 'available', 
      isActive: true 
    });
    const occupiedRooms = await Room.countDocuments({ 
      status: 'occupied', 
      isActive: true 
    });
    const maintenanceRooms = await Room.countDocuments({ 
      status: 'maintenance', 
      isActive: true 
    });

    return {
      total: totalRooms,
      available: availableRooms,
      occupied: occupiedRooms,
      maintenance: maintenanceRooms,
      occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
    };
  }
}

module.exports = new AvailabilityService();
