/**
 * Email Templates Utility
 * Provides HTML email templates for various notifications
 */

const config = require('../config');
const { MESSAGES } = require('./constants');

// Base template with common styling
const getBaseTemplate = (content, footer = true) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coconut Saraih Hotel</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 30px;
    }
    .footer {
      background-color: #333333;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      margin-bottom: 5px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px 0;
    }
    .button:hover {
      background: linear-gradient(135deg, #5568d3 0%, #653d91 100%);
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .details-table th,
    .details-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .details-table th {
      background-color: #f8f9fa;
      font-weight: 600;
      width: 40%;
    }
    .highlight {
      color: #667eea;
      font-weight: bold;
    }
    .success-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    .warning-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100%;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏝️ Coconut Saraih Hotel</h1>
      <p>Your Tropical Paradise Awaits</p>
    </div>
    <div class="content">
      ${content}
    </div>
    ${footer ? `
    <div class="footer">
      <p><strong>Coconut Saraih Hotel</strong></p>
      <p>Zanzibar, Tanzania | +255 700 000 000</p>
      <p>
        <a href="https://coconutsaraih.com">Website</a> | 
        <a href="mailto:info@coconutsaraih.com">Email Us</a>
      </p>
      <p style="margin-top: 10px; opacity: 0.7;">
        © ${new Date().getFullYear()} Coconut Saraih Hotel. All rights reserved.
      </p>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim();
};

/**
 * Welcome Email Template
 */
const sendWelcomeEmail = (user) => {
  const content = `
    <div class="success-icon">👋</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Welcome to Coconut Saraih Hotel!</h2>
    <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
    <p>Thank you for joining us! We're thrilled to have you as our guest.</p>
    <div class="info-box">
      <p><strong>Your Account Details:</strong></p>
      <p>Email: ${user.email}</p>
      <p>Member ID: ${user._id}</p>
    </div>
    <p>With your account, you can:</p>
    <ul style="margin: 15px 0; padding-left: 20px;">
      <li>Book rooms and view reservations</li>
      <li>Explore exciting local activities</li>
      <li>Reserve tables at our restaurants</li>
      <li>Access exclusive member benefits</li>
    </ul>
    <p style="text-align: center;">
      <a href="${config.app.clientUrl}/account" class="button">Visit Your Account</a>
    </p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;
  
  return {
    subject: 'Welcome to Coconut Saraih Hotel! 🌴',
    html: getBaseTemplate(content)
  };
};

/**
 * Booking Confirmation Email Template
 */
const sendBookingConfirmationEmail = (booking, guest) => {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <div class="success-icon">✅</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Booking Confirmed!</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>Thank you for choosing Coconut Saraih Hotel! Your booking has been confirmed.</p>
    
    <table class="details-table">
      <tr>
        <th>Booking Reference</th>
        <td><span class="highlight">${booking.bookingReference}</span></td>
      </tr>
      <tr>
        <th>Check-in Date</th>
        <td>${checkInDate}</td>
      </tr>
      <tr>
        <th>Check-out Date</th>
        <td>${checkOutDate}</td>
      </tr>
      <tr>
        <th>Number of Guests</th>
        <td>${booking.guests}</td>
      </tr>
      <tr>
        <th>Room Type</th>
        <td>${booking.roomType}</td>
      </tr>
      <tr>
        <th>Total Amount</th>
        <td><span class="highlight">${booking.currency || 'USD'} ${booking.totalAmount.toFixed(2)}</span></td>
      </tr>
      ${booking.paymentStatus ? `
      <tr>
        <th>Payment Status</th>
        <td>${booking.paymentStatus}</td>
      </tr>
      ` : ''}
    </table>
    
    <div class="info-box">
      <p><strong>📍 Important Information:</strong></p>
      <p>• Check-in time: 2:00 PM</p>
      <p>• Check-out time: 11:00 AM</p>
      <p>• Please present your booking confirmation upon arrival</p>
    </div>
    
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}/bookings/${booking._id}" class="button">View Booking Details</a>
    </p>
    
    <p>We look forward to welcoming you!</p>
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Booking Confirmed - ${booking.bookingReference} 🏨`,
    html: getBaseTemplate(content)
  };
};

/**
 * Booking Cancellation Email Template
 */
const sendBookingCancellationEmail = (booking, guest) => {
  const content = `
    <div class="warning-icon">❌</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Booking Cancelled</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>We regret to inform you that your booking has been cancelled as requested.</p>
    
    <table class="details-table">
      <tr>
        <th>Booking Reference</th>
        <td>${booking.bookingReference}</td>
      </tr>
      <tr>
        <th>Check-in Date</th>
        <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th>Check-out Date</th>
        <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th>Room Type</th>
        <td>${booking.roomType}</td>
      </tr>
      ${booking.refundAmount ? `
      <tr>
        <th>Refund Amount</th>
        <td><span class="highlight">${booking.currency || 'USD'} ${booking.refundAmount.toFixed(2)}</span></td>
      </tr>
      <tr>
        <th>Refund Status</th>
        <td>Processing (5-10 business days)</td>
      </tr>
      ` : ''}
    </table>
    
    <p>We hope to welcome you soon for a future stay!</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}/bookings" class="button">Browse Available Rooms</a>
    </p>
    
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Booking Cancelled - ${booking.bookingReference}`,
    html: getBaseTemplate(content)
  };
};

/**
 * Payment Confirmation Email Template
 */
const sendPaymentConfirmationEmail = (payment, booking, guest) => {
  const content = `
    <div class="success-icon">💳</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Payment Successful!</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>Thank you! We have received your payment successfully.</p>
    
    <table class="details-table">
      <tr>
        <th>Payment Reference</th>
        <td><span class="highlight">${payment.paymentReference}</span></td>
      </tr>
      <tr>
        <th>Booking Reference</th>
        <td>${booking.bookingReference}</td>
      </tr>
      <tr>
        <th>Amount Paid</th>
        <td><span class="highlight">${payment.currency || 'USD'} ${payment.amount.toFixed(2)}</span></td>
      </tr>
      <tr>
        <th>Payment Method</th>
        <td>${payment.paymentMethod}</td>
      </tr>
      <tr>
        <th>Transaction ID</th>
        <td>${payment.transactionId || 'N/A'}</td>
      </tr>
      <tr>
        <th>Date</th>
        <td>${new Date(payment.createdAt).toLocaleString()}</td>
      </tr>
    </table>
    
    <div class="info-box">
      <p><strong>Next Steps:</strong></p>
      <p>Your booking is now confirmed. We look forward to welcoming you!</p>
    </div>
    
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Payment Confirmed - ${payment.paymentReference} 💰`,
    html: getBaseTemplate(content)
  };
};

/**
 * Check-in Reminder Email Template
 */
const sendCheckInReminderEmail = (booking, guest) => {
  const content = `
    <div class="success-icon">⏰</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Check-in Reminder</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>This is a friendly reminder about your upcoming stay!</p>
    
    <table class="details-table">
      <tr>
        <th>Booking Reference</th>
        <td><span class="highlight">${booking.bookingReference}</span></td>
      </tr>
      <tr>
        <th>Check-in Date</th>
        <td><strong>${new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
      </tr>
      <tr>
        <th>Check-out Date</th>
        <td>${new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <th>Room Type</th>
        <td>${booking.roomType}</td>
      </tr>
    </table>
    
    <div class="info-box">
      <p><strong>📝 Please Remember:</strong></p>
      <p>• Valid ID or passport</p>
      <p>• Booking confirmation (print or digital)</p>
      <p>• Credit card for incidental deposits</p>
    </div>
    
    <p>If you have any special requests, please let us know in advance.</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}/bookings/${booking._id}" class="button">View Booking Details</a>
    </p>
    
    <p style="margin-top: 20px;">See you soon!<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Check-in Tomorrow - ${booking.bookingReference} 🏨`,
    html: getBaseTemplate(content)
  };
};

/**
 * Password Reset Email Template
 */
const sendPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${config.app.clientUrl}/reset-password?token=${resetToken}`;

  const content = `
    <div class="warning-icon">🔐</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
    <p>Dear <strong>${user.firstName}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Your Password</a>
    </p>
    
    <div class="info-box">
      <p><strong>Important:</strong></p>
      <p>• This link will expire in 1 hour</p>
      <p>• If you didn't request this, please ignore this email</p>
      <p>• Don't share this link with anyone</p>
    </div>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; font-size: 12px; color: #666;">${resetUrl}</p>
    
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: 'Password Reset Request 🔐',
    html: getBaseTemplate(content)
  };
};

/**
 * Email Verification Email Template
 */
const sendVerificationEmail = (user, verificationToken) => {
  const verifyUrl = `${config.app.clientUrl}/verify-email?token=${verificationToken}`;

  const content = `
    <div class="success-icon">📧</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Verify Your Email</h2>
    <p>Dear <strong>${user.firstName}</strong>,</p>
    <p>Thank you for registering! Please verify your email address to activate your account.</p>
    
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
    </p>
    
    <div class="info-box">
      <p><strong>Note:</strong></p>
      <p>• This verification link will expire in 24 hours</p>
      <p>• If you didn't create an account, please ignore this email</p>
    </div>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; font-size: 12px; color: #666;">${verifyUrl}</p>
    
    <p style="margin-top: 20px;">Welcome aboard!<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: 'Verify Your Email - Coconut Saraih Hotel 📧',
    html: getBaseTemplate(content)
  };
};

/**
 * Invoice Email Template
 */
const sendInvoiceEmail = (invoice, booking, guest) => {
  const content = `
    <div class="success-icon">📄</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Invoice</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>Please find below your invoice for your stay at Coconut Saraih Hotel.</p>
    
    <table class="details-table">
      <tr>
        <th>Invoice Number</th>
        <td><span class="highlight">${invoice.invoiceNumber}</span></td>
      </tr>
      <tr>
        <th>Booking Reference</th>
        <td>${booking.bookingReference}</td>
      </tr>
      <tr>
        <th>Guest Name</th>
        <td>${guest.firstName} ${guest.lastName}</td>
      </tr>
      <tr>
        <th>Check-in</th>
        <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th>Check-out</th>
        <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th>Room Type</th>
        <td>${booking.roomType}</td>
      </tr>
    </table>
    
    <table class="details-table" style="margin-top: 20px;">
      <tr>
        <th>Room Charges</th>
        <td>${invoice.currency || 'USD'} ${invoice.roomCharges.toFixed(2)}</td>
      </tr>
      ${invoice.taxAmount ? `
      <tr>
        <th>Tax (${(invoice.taxRate * 100).toFixed(0)}%)</th>
        <td>${invoice.currency || 'USD'} ${invoice.taxAmount.toFixed(2)}</td>
      </tr>
      ` : ''}
      ${invoice.discount ? `
      <tr>
        <th>Discount</th>
        <td>-${invoice.currency || 'USD'} ${invoice.discount.toFixed(2)}</td>
      </tr>
      ` : ''}
      <tr>
        <th><strong>Total Amount</strong></th>
        <td><span class="highlight"><strong>${invoice.currency || 'USD'} ${invoice.totalAmount.toFixed(2)}</strong></span></td>
      </tr>
      ${invoice.paidAmount ? `
      <tr>
        <th>Amount Paid</th>
        <td>-${invoice.currency || 'USD'} ${invoice.paidAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <th><strong>Balance Due</strong></th>
        <td><span class="highlight"><strong>${invoice.currency || 'USD'} ${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</strong></span></td>
      </tr>
      ` : ''}
    </table>
    
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}/invoices/${invoice._id}" class="button">Download Invoice</a>
    </p>
    
    <p style="margin-top: 20px;">Thank you for your business!</p>
    <p>Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Invoice ${invoice.invoiceNumber} - Coconut Saraih Hotel 📄`,
    html: getBaseTemplate(content)
  };
};

/**
 * Contact Form Confirmation Email Template
 */
const sendContactConfirmationEmail = (contact) => {
  const content = `
    <div class="success-icon">✉️</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Message Received</h2>
    <p>Dear <strong>${contact.name}</strong>,</p>
    <p>Thank you for reaching out to us! We have received your message and will get back to you within 24-48 hours.</p>
    
    <table class="details-table">
      <tr>
        <th>Subject</th>
        <td>${contact.subject}</td>
      </tr>
      <tr>
        <th>Message</th>
        <td>${contact.message}</td>
      </tr>
      <tr>
        <th>Submitted On</th>
        <td>${new Date(contact.createdAt).toLocaleString()}</td>
      </tr>
    </table>
    
    <div class="info-box">
      <p><strong>What happens next?</strong></p>
      <p>Our team will review your inquiry and respond to your email address.</p>
    </div>
    
    <p>In the meantime, feel free to explore our website or contact us directly at +255 700 000 000.</p>
    
    <p style="margin-top: 20px;">Best regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: 'We Received Your Message - Coconut Saraih Hotel ✉️',
    html: getBaseTemplate(content)
  };
};

/**
 * Activity Booking Confirmation Email Template
 */
const sendActivityConfirmationEmail = (activityBooking, guest) => {
  const content = `
    <div class="success-icon">🏄</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Activity Booking Confirmed!</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>Your booking for an exciting activity has been confirmed!</p>
    
    <table class="details-table">
      <tr>
        <th>Activity</th>
        <td><span class="highlight">${activityBooking.activityName}</span></td>
      </tr>
      <tr>
        <th>Booking Reference</th>
        <td>${activityBooking.bookingReference}</td>
      </tr>
      <tr>
        <th>Date</th>
        <td>${new Date(activityBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <th>Time</th>
        <td>${activityBooking.time}</td>
      </tr>
      <tr>
        <th>Number of Guests</th>
        <td>${activityBooking.guests}</td>
      </tr>
      <tr>
        <th>Total Amount</th>
        <td><span class="highlight">${activityBooking.currency || 'USD'} ${activityBooking.totalAmount.toFixed(2)}</span></td>
      </tr>
    </table>
    
    <div class="info-box">
      <p><strong>📍 Meeting Point:</strong></p>
      <p>${activityBooking.meetingPoint || 'Hotel Lobby'}</p>
      <p><strong>⏰ Please arrive 15 minutes before the scheduled time</strong></p>
    </div>
    
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}/activities/${activityBooking.activityId}" class="button">View Activity Details</a>
    </p>
    
    <p>Get ready for an amazing experience!</p>
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Activity Confirmed - ${activityBooking.activityName} 🏄`,
    html: getBaseTemplate(content)
  };
};

/**
 * Restaurant Reservation Confirmation Email Template
 */
const sendRestaurantReservationEmail = (reservation, guest) => {
  const content = `
    <div class="success-icon">🍽️</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Table Reservation Confirmed!</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>Your table reservation has been confirmed. We look forward to serving you!</p>
    
    <table class="details-table">
      <tr>
        <th>Restaurant</th>
        <td><span class="highlight">${reservation.restaurantName}</span></td>
      </tr>
      <tr>
        <th>Reservation Reference</th>
        <td>${reservation.reservationReference}</td>
      </tr>
      <tr>
        <th>Date</th>
        <td>${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <th>Time</th>
        <td>${reservation.time}</td>
      </tr>
      <tr>
        <th>Number of Guests</th>
        <td>${reservation.guests}</td>
      </tr>
      <tr>
        <th>Table Type</th>
        <td>${reservation.tableType || 'Standard'}</td>
      </tr>
      ${reservation.specialRequests ? `
      <tr>
        <th>Special Requests</th>
        <td>${reservation.specialRequests}</td>
      </tr>
      ` : ''}
    </table>
    
    <div class="info-box">
      <p><strong>💡 Tips for your dining experience:</strong></p>
      <p>• Formal dress code is recommended</p>
      <p>• Arrive a few minutes early to be seated</p>
      <p>• Feel free to browse our menu in advance</p>
    </div>
    
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}/restaurants/${reservation.restaurantId}" class="button">View Restaurant</a>
    </p>
    
    <p>Bon appétit!</p>
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: `Table Reserved - ${reservation.restaurantName} 🍽️`,
    html: getBaseTemplate(content)
  };
};

/**
 * Feedback Request Email Template
 */
const sendFeedbackRequestEmail = (booking, guest) => {
  const content = `
    <div class="success-icon">💭</div>
    <h2 style="text-align: center; margin-bottom: 20px;">We'd Love Your Feedback!</h2>
    <p>Dear <strong>${guest.firstName} ${guest.lastName}</strong>,</p>
    <p>Thank you for staying with us at Coconut Saraih Hotel!</p>
    <p>We hope you had a wonderful experience and would appreciate a few moments of your time to share your feedback.</p>
    
    <p style="text-align: center;">
      <a href="${config.app.clientUrl}/feedback?booking=${booking._id}" class="button">Share Your Feedback</a>
    </p>
    
    <div class="info-box">
      <p>Your feedback helps us improve and provide better service to all our guests.</p>
    </div>
    
    <p>Thank you for choosing Coconut Saraih Hotel!</p>
    <p style="margin-top: 20px;">Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: 'Share Your Experience - Coconut Saraih Hotel 💭',
    html: getBaseTemplate(content)
  };
};

/**
 * Newsletter Subscription Email Template
 */
const sendNewsletterSubscriptionEmail = (email) => {
  const content = `
    <div class="success-icon">📰</div>
    <h2 style="text-align: center; margin-bottom: 20px;">Welcome to Our Newsletter!</h2>
    <p>Thank you for subscribing to the Coconut Saraih Hotel newsletter!</p>
    <p>You'll now receive:</p>
    <ul style="margin: 15px 0; padding-left: 20px;">
      <li>Exclusive special offers and promotions</li>
      <li>New activity and event announcements</li>
      <li>Travel tips and local guides</li>
      <li>Behind-the-scenes stories from our resort</li>
    </ul>
    
    <p style="text-align: center; margin-top: 20px;">
      <a href="${config.app.clientUrl}" class="button">Explore Our Hotel</a>
    </p>
    
    <div class="info-box">
      <p><strong>Want to unsubscribe?</strong></p>
      <p>If you no longer wish to receive our newsletter, click the unsubscribe link at the bottom of any newsletter email.</p>
    </div>
    
    <p style="margin-top: 20px;">Stay tuned for exciting updates!</p>
    <p>Warm regards,<br><strong>The Coconut Saraih Team</strong></p>
  `;

  return {
    subject: 'Welcome to Coconut Saraih Hotel Newsletter! 📰',
    html: getBaseTemplate(content)
  };
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendPaymentConfirmationEmail,
  sendCheckInReminderEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendInvoiceEmail,
  sendContactConfirmationEmail,
  sendActivityConfirmationEmail,
  sendRestaurantReservationEmail,
  sendFeedbackRequestEmail,
  sendNewsletterSubscriptionEmail
};
