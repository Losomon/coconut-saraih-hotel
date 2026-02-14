const Room = require('../models/Room');
const Booking = require('../models/Booking');

/**
 * Pricing Service - Dynamic pricing and calculations
 */
class PricingService {
  /**
   * Get dynamic price for a room on a specific date
   */
  async getDynamicPrice(roomId, checkInDate) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    let price = room.price.base;

    // Check for seasonal pricing
    if (room.price.seasonal && room.price.seasonal.length > 0) {
      const date = new Date(checkInDate);
      
      for (const season of room.price.seasonal) {
        const start = new Date(season.startDate);
        const end = new Date(season.endDate);
        
        if (date >= start && date <= end) {
          price = season.rate;
          break;
        }
      }
    }

    // Apply day-of-week adjustments
    const dayOfWeek = new Date(checkInDate).getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday & Saturday
      price = price * 1.15; // 15% increase
    }

    // Apply special event pricing (could be fetched from config/database)
    // This would check for holidays, local events, etc.

    return Math.round(price * 100) / 100;
  }

  /**
   * Calculate total pricing for a booking
   */
  async calculateRoomPricing(roomId, checkIn, checkOut) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    // Calculate nightly rates
    const nightlyRates = [];
    let totalRoomRate = 0;

    for (let i = 0; i < nights; i++) {
      const date = new Date(checkInDate);
      date.setDate(date.getDate() + i);
      
      const rate = await this.getDynamicPrice(roomId, date);
      nightlyRates.push({
        date: date.toISOString().split('T')[0],
        rate
      });
      totalRoomRate += rate;
    }

    // Calculate taxes
    const taxRate = 0.16; // VAT
    const serviceFeeRate = 0.02;
    
    const taxes = totalRoomRate * taxRate;
    const serviceFees = totalRoomRate * serviceFeeRate;
    const subtotal = totalRoomRate + taxes + serviceFees;

    return {
      room: {
        id: room._id,
        name: room.name,
        type: room.type,
        roomNumber: room.roomNumber
      },
      dates: {
        checkIn,
        checkOut,
        nights
      },
      pricing: {
        nightlyRates,
        roomRate: totalRoomRate,
        averageNightlyRate: totalRoomRate / nights,
        taxes,
        serviceFees,
        subtotal,
        total: subtotal,
        currency: 'USD'
      }
    };
  }

  /**
   * Calculate group booking discount
   */
  calculateGroupDiscount(roomCount, subtotal) {
    let discountPercentage = 0;
    
    if (roomCount >= 5) {
      discountPercentage = 0.10; // 10% for 5+ rooms
    } else if (roomCount >= 3) {
      discountPercentage = 0.05; // 5% for 3+ rooms
    }

    if (discountPercentage > 0) {
      return {
        type: 'group',
        percentage: discountPercentage * 100,
        amount: subtotal * discountPercentage
      };
    }

    return null;
  }

  /**
   * Calculate long stay discount
   */
  calculateLongStayDiscount(nights) {
    let discountPercentage = 0;
    
    if (nights >= 14) {
      discountPercentage = 0.20; // 20% for 14+ nights
    } else if (nights >= 7) {
      discountPercentage = 0.15; // 15% for 7+ nights
    } else if (nights >= 3) {
      discountPercentage = 0.10; // 10% for 3+ nights
    }

    if (discountPercentage > 0) {
      return {
        type: 'long_stay',
        percentage: discountPercentage * 100,
        nights
      };
    }

    return null;
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(code, bookingTotal) {
    // This would typically look up from a PromoCode model
    // Example implementation:
    /*
    const promo = await PromoCode.findOne({
      code,
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

    if (!promo) {
      return null;
    }

    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (bookingTotal * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Apply max discount cap if set
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }

    return {
      code: promo.code,
      type: promo.discountType,
      amount: discountAmount
    };
    */

    return null;
  }

  /**
   * Get price breakdown for display
   */
  async getPriceBreakdown(roomId, checkIn, checkOut, promoCode = null) {
    const pricing = await this.calculateRoomPricing(roomId, checkIn, checkOut);
    let discounts = [];

    // Apply long stay discount
    const longStayDiscount = this.calculateLongStayDiscount(pricing.dates.nights);
    if (longStayDiscount) {
      discounts.push(longStayDiscount);
    }

    // Apply promo code
    if (promoCode) {
      const promoDiscount = await this.applyPromoCode(
        promoCode,
        pricing.pricing.subtotal
      );
      if (promoDiscount) {
        discounts.push(promoDiscount);
      }
    }

    // Calculate total discount
    const totalDiscount = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      ...pricing,
      discounts,
      totalDiscount,
      grandTotal: pricing.pricing.subtotal - totalDiscount
    };
  }

  /**
   * Calculate RevPAR (Revenue Per Available Room)
   */
  async calculateRevPAR(startDate, endDate) {
    const bookings = await Booking.find({
      status: 'completed',
      checkIn: { $gte: new Date(startDate) },
      checkOut: { $lte: new Date(endDate) }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
    const totalRooms = await Room.countDocuments({ isActive: true });
    
    // Calculate days in period
    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    
    const availableRoomNights = totalRooms * days;
    const revPAR = totalRevenue / availableRoomNights;

    return {
      totalRevenue,
      totalRooms,
      days,
      availableRoomNights,
      revPAR: Math.round(revPAR * 100) / 100
    };
  }

  /**
   * Calculate ADR (Average Daily Rate)
   */
  async calculateADR(startDate, endDate) {
    const bookings = await Booking.find({
      status: 'completed',
      checkIn: { $gte: new Date(startDate) },
      checkOut: { $lte: new Date(endDate) }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.roomRate || 0), 0);
    const totalNights = bookings.reduce((sum, b) => sum + (b.pricing?.nights || 0), 0);

    const adr = totalNights > 0 ? totalRevenue / totalNights : 0;

    return {
      totalRevenue,
      totalNights,
      adr: Math.round(adr * 100) / 100
    };
  }
}

module.exports = new PricingService();
