const logger = require('../utils/logger');

/**
 * SMS Service - SMS sending via Twilio or Africa's Talking
 */
class SmsService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio'; // 'twilio' or 'africastalking'
  }

  /**
   * Send SMS
   */
  async send(phoneNumber, message) {
    try {
      if (this.provider === 'twilio') {
        return await this.sendTwilio(phoneNumber, message);
      } else if (this.provider === 'africastalking') {
        return await this.sendAfricaTalking(phoneNumber, message);
      }
    } catch (error) {
      logger.error(`SMS error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send via Twilio
   */
  async sendTwilio(phoneNumber, message) {
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info(`SMS sent via Twilio: ${result.sid}`);
    return { success: true, messageId: result.sid };
  }

  /**
   * Send via Africa's Talking
   */
  async sendAfricaTalking(phoneNumber, message) {
    const africasTalking = require('africastalking')({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME
    });

    const result = await africasTalking.SMS.send({
      to: [phoneNumber],
      message
    });

    logger.info(`SMS sent via AT: ${JSON.stringify(result)}`);
    return { success: true, messageId: result[0].messageId };
  }

  /**
   * Send booking confirmation SMS
   */
  async sendBookingConfirmation(phoneNumber, booking) {
    const message = `Coconut Saraih: Your booking ${booking.bookingReference} is confirmed! Check-in: ${new Date(booking.checkIn).toLocaleDateString()}. Thank you!`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send check-in reminder SMS
   */
  async sendCheckInReminder(phoneNumber, booking) {
    const message = `Coconut Saraih: Reminder! Your check-in is tomorrow (${new Date(booking.checkIn).toLocaleDateString()}). Room: ${booking.room?.name}. See you soon!`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(phoneNumber, booking, amount) {
    const message = `Coconut Saraih: Payment of $${amount} received for ${booking.bookingReference}. Thank you!`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send booking cancellation SMS
   */
  async sendBookingCancellation(phoneNumber, booking) {
    const message = `Coconut Saraih: Your booking ${booking.bookingReference} has been cancelled. If you have questions, please contact us.`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send OTP SMS
   */
  async sendOTP(phoneNumber, otp) {
    const message = `Coconut Saraih: Your verification code is ${otp}. Valid for 10 minutes.`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send reservation confirmation SMS
   */
  async sendReservationConfirmation(phoneNumber, reservation) {
    const message = `Coconut Saraih: Table reserved for ${reservation.partySize} on ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time}. Ref: ${reservation.reservationNumber}`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send activity booking confirmation SMS
   */
  async sendActivityConfirmation(phoneNumber, activity, date) {
    const message = `Coconut Saraih: Activity "${activity.name}" booked for ${new Date(date).toLocaleDateString()} at ${activity.time}. Enjoy!`;
    return this.send(phoneNumber, message);
  }

  /**
   * Send bulk SMS (admin)
   */
  async sendBulk(phoneNumbers, message) {
    const results = await Promise.all(
      phoneNumbers.map(phone => this.send(phone, message))
    );
    return results;
  }
}

module.exports = new SmsService();
