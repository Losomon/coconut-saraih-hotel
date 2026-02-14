/**
 * Email Service Configuration
 */

const nodemailer = require('nodemailer');
const config = require('./index');

let emailTransporter = null;

/**
 * Create email transporter based on configuration
 */
const createEmailTransporter = () => {
  const emailConfig = config.email;

  // If SendGrid API key is available, use SendGrid
  if (emailConfig.sendGridApiKey) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: emailConfig.sendGridApiKey
      }
    });
  }

  // If AWS SES is configured
  if (emailConfig.awsSesConfig.accessKeyId) {
    return nodemailer.createTransport({
      host: `email.${emailConfig.awsSesConfig.region}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: {
        user: emailConfig.awsSesConfig.accessKeyId,
        pass: emailConfig.awsSesConfig.secretAccessKey
      }
    });
  }

  // Default to Gmail or custom SMTP
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass
    }
  });
};

/**
 * Initialize email transporter
 */
const initializeEmail = () => {
  try {
    emailTransporter = createEmailTransporter();
    console.log('Email transporter initialized');
    return emailTransporter;
  } catch (error) {
    console.error('Failed to initialize email transporter:', error.message);
    return null;
  }
};

/**
 * Get email transporter instance
 */
const getEmailTransporter = () => emailTransporter;

/**
 * Send email utility function
 */
const sendEmail = async ({ to, subject, text, html, from, replyTo, cc, bcc, attachments }) => {
  if (!emailTransporter) {
    console.error('Email transporter not initialized');
    return { success: false, error: 'Email service not available' };
  }

  try {
    const info = await emailTransporter.sendMail({
      from: from || config.email.from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || '',
      html: html || '',
      replyTo: replyTo || config.email.from,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      attachments: attachments || []
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Email template generators
 */
const emailTemplates = {
  /**
   * Booking confirmation email
   */
  bookingConfirmation: (booking, guest) => ({
    subject: `Booking Confirmation - ${booking.bookingReference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-ref { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .details-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .total { font-size: 20px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌴 Coconut Saraih Hotel</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="content">
          <p>Dear ${guest.firstName} ${guest.lastName},</p>
          <p>Thank you for choosing Coconut Saraih Hotel. Your booking has been confirmed!</p>
          
          <div class="booking-ref">Reference: ${booking.bookingReference}</div>
          
          <div class="details">
            <div class="details-row">
              <span class="label">Check-in:</span>
              <span class="value">${new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="details-row">
              <span class="label">Check-out:</span>
              <span class="value">${new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="details-row">
              <span class="label">Nights:</span>
              <span class="value">${booking.nights}</span>
            </div>
            <div class="details-row">
              <span class="label">Room:</span>
              <span class="value">${booking.room?.name || 'Standard Room'}</span>
            </div>
            <div class="details-row">
              <span class="label">Guests:</span>
              <span class="value">${booking.guests.adults} Adult(s), ${booking.guests.children} Child(ren)</span>
            </div>
            <div class="details-row">
              <span class="label">Total Amount:</span>
              <span class="value total">${booking.pricing.currency} ${booking.pricing.total.toFixed(2)}</span>
            </div>
          </div>
          
          ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
          
          <p><strong>Check-in Time:</strong> 2:00 PM<br>
          <strong>Check-out Time:</strong> 11:00 AM</p>
          
          <p>For any inquiries, please contact us at info@coconutsaraih.com or call +254 700 000 000.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Coconut Saraih Hotel. All rights reserved.</p>
            <p>Mombasa, Kenya | www.coconutsaraih.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Dear ${guest.firstName} ${guest.lastName},\n\nThank you for choosing Coconut Saraih Hotel. Your booking has been confirmed!\n\nBooking Reference: ${booking.bookingReference}\nCheck-in: ${new Date(booking.checkIn).toLocaleDateString()}\nCheck-out: ${new Date(booking.checkOut).toLocaleDateString()}\nNights: ${booking.nights}\nRoom: ${booking.room?.name || 'Standard Room'}\nTotal: ${booking.pricing.currency} ${booking.pricing.total.toFixed(2)}\n\nFor any inquiries, please contact us at info@coconutsaraih.com`
  }),

  /**
   * Payment confirmation email
   */
  paymentConfirmation: (payment, booking) => ({
    subject: `Payment Confirmed - ${booking.bookingReference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🌴 Payment Confirmed</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Your payment has been successfully processed!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
            <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p><strong>Amount Paid:</strong> ${payment.currency} ${payment.amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${payment.method}</p>
            <p><strong>Status:</strong> <span style="color: green;">Completed</span></p>
          </div>
          <p>Thank you for your payment. We look forward to welcoming you!</p>
        </div>
      </body>
      </html>
    `,
    text: `Your payment has been successfully processed!\n\nTransaction ID: ${payment.transactionId}\nBooking Reference: ${booking.bookingReference}\nAmount Paid: ${payment.currency} ${payment.amount.toFixed(2)}\nPayment Method: ${payment.method}\n\nThank you for your payment.`
  }),

  /**
   * Password reset email
   */
  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset - Coconut Saraih Hotel',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🌴 Password Reset</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Dear ${user.firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Coconut Saraih Hotel. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Dear ${user.firstName},\n\nWe received a request to reset your password. Please use the following link to create a new password:\n\n${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`
  }),

  /**
   * Booking cancellation email
   */
  bookingCancellation: (booking, guest) => ({
    subject: `Booking Cancelled - ${booking.bookingReference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🌴 Booking Cancelled</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Dear ${guest.firstName} ${guest.lastName},</p>
          <p>Your booking has been cancelled as requested.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
            ${booking.cancellation?.refundAmount ? `<p><strong>Refund Amount:</strong> ${booking.pricing.currency} ${booking.cancellation.refundAmount.toFixed(2)}</p>` : ''}
          </div>
          <p>We hope to welcome you another time!</p>
        </div>
      </body>
      </html>
    `,
    text: `Dear ${guest.firstName} ${guest.lastName},\n\nYour booking has been cancelled as requested.\n\nBooking Reference: ${booking.bookingReference}\n\nWe hope to welcome you another time!`
  })
};

module.exports = {
  initializeEmail,
  getEmailTransporter,
  sendEmail,
  emailTemplates
};
