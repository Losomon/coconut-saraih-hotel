const Booking = require('../models/Booking');
const TableReservation = require('../models/TableReservation');
const Event = require('../models/Event');

/**
 * Calendar Service - Calendar management
 */
class CalendarService {
  /**
   * Get bookings calendar
   */
  async getBookingsCalendar(startDate, endDate, filters = {}) {
    let query = {
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        { checkIn: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { checkOut: { $gte: new Date(startDate), $lte: new Date(endDate) } }
      ]
    };

    if (filters.roomId) query.room = filters.roomId;
    if (filters.status) query.status = filters.status;

    const bookings = await Booking.find(query)
      .populate('room', 'roomNumber type name')
      .populate('guest', 'personalInfo')
      .select('checkIn checkOut status room guest bookingReference');

    return bookings;
  }

  /**
   * Get restaurant reservations calendar
   */
  async getReservationsCalendar(startDate, endDate) {
    const reservations = await TableReservation.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $nin: ['cancelled', 'no-show'] }
    })
      .populate('guest', 'personalInfo')
      .select('date time partySize tableNumber status guest');

    return reservations;
  }

  /**
   * Get events calendar
   */
  async getEventsCalendar(startDate, endDate) {
    const events = await Event.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ['confirmed', 'in-progress'] }
    })
      .populate('hall', 'name')
      .select('eventName eventType date startTime endTime hall status');

    return events;
  }

  /**
   * Get combined calendar (all events)
   */
  async getCombinedCalendar(startDate, endDate) {
    const [bookings, reservations, events] = await Promise.all([
      this.getBookingsCalendar(startDate, endDate),
      this.getReservationsCalendar(startDate, endDate),
      this.getEventsCalendar(startDate, endDate)
    ]);

    return {
      bookings,
      reservations,
      events
    };
  }

  /**
   * Get daily schedule
   */
  async getDailySchedule(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get check-ins
    const checkIns = await Booking.find({
      checkIn: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['confirmed'] }
    }).populate('guest personalInfo room');

    // Get check-outs
    const checkOuts = await Booking.find({
      checkOut: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['checked-in'] }
    }).populate('guest personalInfo room');

    // Get restaurant reservations
    const reservations = await TableReservation.find({
      date: { $eq: new Date(date) },
      status: { $nin: ['cancelled', 'no-show'] }
    }).populate('guest personalInfo');

    return {
      date,
      checkIns,
      checkOuts,
      reservations
    };
  }
}

module.exports = new CalendarService();
