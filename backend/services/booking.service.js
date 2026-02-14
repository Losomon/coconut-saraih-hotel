const Booking = require('../models/Booking');
const Room = require('../models/Room');
const PricingService = require('./pricing.service');

/**
 * Booking Service - Business logic for bookings
 */
class BookingService {
  /**
   * Check if a room is available for given dates
   */
  async checkAvailability(roomId, checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate, $gte: checkInDate }
        },
        {
          checkOut: { $gt: checkInDate, $lte: checkOutDate }
        },
        {
          checkIn: { $lte: checkInDate },
          checkOut: { $gte: checkOutDate }
        }
      ]
    });

    return !existingBooking;
  }

  /**
   * Calculate booking pricing
   */
  async calculatePricing(roomId, checkIn, checkOut, promoCode = null) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    // Get dynamic pricing for each night
    let totalRoomRate = 0;
    for (let i = 0; i < nights; i++) {
      const date = new Date(checkInDate);
      date.setDate(date.getDate() + i);
      const nightPrice = await PricingService.getDynamicPrice(roomId, date);
      totalRoomRate += nightPrice;
    }

    // Calculate taxes (e.g., 16% VAT + 2% service charge)
    const taxRate = 0.16;
    const serviceFeeRate = 0.02;
    const taxes = totalRoomRate * taxRate;
    const serviceFees = totalRoomRate * serviceFeeRate;

    // Apply discounts
    let discounts = [];
    if (promoCode) {
      const discount = await this.applyPromoCode(promoCode, totalRoomRate);
      if (discount) {
        discounts.push(discount);
      }
    }

    const subtotal = totalRoomRate + taxes + serviceFees;
    const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
    const total = Math.max(0, subtotal + totalDiscount);

    return {
      roomRate: totalRoomRate,
      taxes,
      serviceFees,
      discounts,
      total,
      currency: 'USD',
      nights,
      nightlyRate: totalRoomRate / nights
    };
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(code, subtotal) {
    // This would typically check a PromoCode model
    // For now, return null (no promo applied)
    // Example promo codes could be implemented
    return null;
  }

  /**
   * Generate booking reference
   */
  generateBookingReference() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CSH-${dateStr}-${random}`;
  }

  /**
   * Calculate refund amount
   */
  async calculateRefund(booking) {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    
    // Calculate days until check-in
    const daysUntilCheckIn = Math.ceil(
      (checkIn - now) / (1000 * 60 * 60 * 24)
    );

    // Full refund if more than 7 days before check-in
    if (daysUntilCheckIn >= 7) {
      return booking.pricing.total;
    }

    // Partial refund based on policy
    if (daysUntilCheckIn >= 3) {
      return booking.pricing.total * 0.5; // 50% refund
    }

    if (daysUntilCheckIn > 0) {
      return booking.pricing.total * 0.25; // 25% refund
    }

    return 0; // No refund
  }

  /**
   * Get unavailable dates for a room
   */
  async getUnavailableDates(roomId, startDate, endDate) {
    const bookings = await Booking.find({
      room: roomId,
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        {
          checkIn: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          checkOut: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      ]
    }).select('checkIn checkOut bookingReference');

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
   * Get booking by reference
   */
  async getByReference(bookingReference) {
    return Booking.findOne({ bookingReference })
      .populate('room')
      .populate('guest');
  }

  /**
   * Cancel booking
   */
  async cancel(bookingId, reason, cancelledBy) {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (['checked-in', 'checked-out', 'cancelled'].includes(booking.status)) {
      throw new Error('Booking cannot be cancelled');
    }

    // Calculate refund
    let refundAmount = 0;
    if (booking.payment?.status === 'paid') {
      refundAmount = await this.calculateRefund(booking);
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy,
      reason,
      refundAmount
    };

    await booking.save();

    // Update room status
    await Room.findByIdAndUpdate(booking.room, { status: 'available' });

    return booking;
  }

  /**
   * Confirm booking (after payment)
   */
  async confirm(bookingId) {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed' },
      { new: true }
    );

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update payment status
    booking.payment = {
      ...booking.payment,
      status: 'paid'
    };
    await booking.save();

    return booking;
  }

  /**
   * Get bookings by date range
   */
  async getByDateRange(startDate, endDate, filters = {}) {
    const query = {
      $or: [
        {
          checkIn: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          checkOut: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      ]
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.roomId) {
      query.room = filters.roomId;
    }

    return Booking.find(query)
      .populate('room', 'roomNumber type')
      .populate('guest', 'personalInfo')
      .sort({ checkIn: 1 });
  }

  /**
   * Get guest booking history
   */
  async getGuestHistory(guestId) {
    return Booking.find({ guest: guestId })
      .populate('room', 'roomNumber type name images')
      .sort({ createdAt: -1 });
  }

  /**
   * Calculate occupancy for date range
   */
  async calculateOccupancy(startDate, endDate) {
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkIn: { $lte: new Date(endDate) },
          checkOut: { $gte: new Date(startDate) }
        }
      ]
    });

    const totalRooms = await Room.countDocuments({ isActive: true });
    const occupiedRooms = new Set(bookings.map(b => b.room.toString()));
    
    return {
      totalRooms,
      occupiedRooms: occupiedRooms.size,
      occupancyRate: (occupiedRooms.size / totalRooms) * 100
    };
  }
}

module.exports = new BookingService();
