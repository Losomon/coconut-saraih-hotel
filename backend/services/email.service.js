const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service - Email sending and templates
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailgun.org',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send email
   */
  async send(options) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Email error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(booking) {
    const subject = `Booking Confirmed - ${booking.bookingReference}`;
    const html = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${booking.guest?.name || 'Guest'},</p>
      <p>Your booking has been confirmed!</p>
      <h2>Booking Details</h2>
      <ul>
        <li><strong>Reference:</strong> ${booking.bookingReference}</li>
        <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
        <li><strong>Room:</strong> ${booking.room?.name}</li>
        <li><strong>Total:</strong> $${booking.pricing?.total}</li>
      </ul>
      <p>We look forward to welcoming you!</p>
    `;

    return this.send({
      to: booking.guest?.email,
      subject,
      html
    });
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(booking, payment) {
    const subject = `Payment Confirmed - ${booking.bookingReference}`;
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Dear ${booking.guest?.name || 'Guest'},</p>
      <p>Your payment has been processed successfully.</p>
      <h2>Payment Details</h2>
      <ul>
        <li><strong>Booking Reference:</strong> ${booking.bookingReference}</li>
        <li><strong>Amount:</strong> $${payment.amount}</li>
        <li><strong>Method:</strong> ${payment.method}</li>
        <li><strong>Transaction ID:</strong> ${payment.transactionId}</li>
      </ul>
    `;

    return this.send({
      to: booking.guest?.email,
      subject,
      html
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.send({
      to: email,
      subject,
      html
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Coconut Saraih Hotel';
    const html = `
      <h1>Welcome!</h1>
      <p>Dear ${user.name},</p>
      <p>Thank you for registering with Coconut Saraih Hotel.</p>
      <p>You can now:</p>
      <ul>
        <li>Book rooms and view availability</li>
        <li>Reserve tables at our restaurant</li>
        <li>Book activities and spa services</li>
        <li>View your booking history</li>
      </ul>
    `;

    return this.send({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Send check-in reminder
   */
  async sendCheckInReminder(booking) {
    const subject = `Check-in Reminder - ${booking.bookingReference}`;
    const html = `
      <h1>Check-in Reminder</h1>
      <p>Dear ${booking.guest?.name || 'Guest'},</p>
      <p>This is a reminder that your check-in is tomorrow!</p>
      <h2>Booking Details</h2>
      <ul>
        <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
        <li><strong>Room:</strong> ${booking.room?.name}</li>
      </ul>
    `;

    return this.send({
      to: booking.guest?.email,
      subject,
      html
    });
  }

  /**
   * Send booking cancellation
   */
  async sendBookingCancellation(booking) {
    const subject = `Booking Cancelled - ${booking.bookingReference}`;
    const html = `
      <h1>Booking Cancelled</h1>
      <p>Dear ${booking.guest?.name || 'Guest'},</p>
      <p>Your booking has been cancelled as requested.</p>
      <p>Booking Reference: ${booking.bookingReference}</p>
      ${booking.cancellation?.refundAmount > 0 ? `<p>A refund of $${booking.cancellation.refundAmount} will be processed.</p>` : ''}
    `;

    return this.send({
      to: booking.guest?.email,
      subject,
      html
    });
  }

  /**
   * Send contact form confirmation
   */
  async sendContactConfirmation(name, email) {
    const subject = 'We Received Your Message';
    const html = `
      <h1>Thank you for contacting us!</h1>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you within 24 hours.</p>
    `;

    return this.send({
      to: email,
      subject,
      html
    });
  }

  /**
   * Send newsletter subscription
   */
  async sendNewsletterSubscription(email) {
    const subject = 'Welcome to Our Newsletter!';
    const html = `
      <h1>Welcome!</h1>
      <p>You have successfully subscribed to our newsletter.</p>
    `;

    return this.send({
      to: email,
      subject,
      html
    });
  }
}

module.exports = new EmailService();
