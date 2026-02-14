/**
 * SMS Templates Utility
 * Provides SMS message templates for various notifications
 */

/**
 * Welcome SMS Template
 */
const sendWelcomeSMS = (firstName) => {
  return `Welcome to Coconut Saraih Hotel, ${firstName}! 🌴
Your account has been created successfully.
Explore our rooms, activities, and dining at coconutsaraih.com

Questions? Reply to this message or call +255 700 000 000`;
};

/**
 * Booking Confirmation SMS Template
 */
const sendBookingConfirmationSMS = (bookingReference, checkIn, checkOut) => {
  return `Coconut Saraih Hotel 🏨
Booking Confirmed!

Ref: ${bookingReference}
Check-in: ${checkIn}
Check-out: ${checkOut}

Show this message at check-in. See you soon! 🌴`;
};

/**
 * Booking Cancellation SMS Template
 */
const sendBookingCancellationSMS = (bookingReference) => {
  return `Coconut Saraih Hotel 🏨
Your booking (${bookingReference}) has been cancelled.

If you did not request this, please contact us immediately.
We hope to welcome you soon!`;
};

/**
 * Payment Confirmation SMS Template
 */
const sendPaymentConfirmationSMS = (amount, currency, bookingRef) => {
  return `Coconut Saraih Hotel 💰
Payment of ${currency || 'USD'} ${amount.toFixed(2)} received for booking ${bookingRef}.

Thank you! Your booking is confirmed.`;
};

/**
 * Check-in Reminder SMS Template (1 day before)
 */
const sendCheckInReminderSMS = (bookingReference, checkInTime) => {
  return `Coconut Saraih Hotel 🏨
Reminder: Check-in tomorrow!

Ref: ${bookingReference}
Check-in time: ${checkInTime || '2:00 PM'}

See you soon! 🌴`;
};

/**
 * Check-out Reminder SMS Template
 */
const sendCheckOutReminderSMS = (bookingReference, checkOutTime) => {
  return `Coconut Saraih Hotel 🏨
Reminder: Check-out today!

Ref: ${bookingReference}
Check-out time: ${checkOutTime || '11:00 AM'}

Thank you for staying with us! Safe travels!`;
};

/**
 * Payment Due SMS Template
 */
const sendPaymentDueSMS = (bookingReference, amount, currency, dueDate) => {
  return `Coconut Saraih Hotel 💰
Payment Due

Booking: ${bookingReference}
Amount: ${currency || 'USD'} ${amount.toFixed(2)}
Due: ${dueDate}

Please complete payment to confirm your booking.`;
};

/**
 * OTP Verification SMS Template
 */
const sendOTPSMS = (otp, purpose) => {
  return `Coconut Saraih Hotel 🔐
Your verification code is: ${otp}

This code expires in 10 minutes.
Do not share this code with anyone.`;
};

/**
 * Password Reset SMS Template
 */
const sendPasswordResetSMS = (resetToken) => {
  return `Coconut Saraih Hotel 🔐
Password Reset Request

Use code: ${resetToken}

This code expires in 1 hour.
If you didn't request this, ignore this message.`;
};

/**
 * Activity Booking Confirmation SMS Template
 */
const sendActivityConfirmationSMS = (activityName, date, time, bookingRef) => {
  return `Coconut Saraih Hotel 🏄
Activity Confirmed!

${activityName}
Date: ${date}
Time: ${time}
Ref: ${bookingRef}

Meet at hotel lobby 15 mins before. Have fun!`;
};

/**
 * Restaurant Reservation SMS Template
 */
const sendRestaurantReservationSMS = (restaurantName, date, time, guests, bookingRef) => {
  return `Coconut Saraih Hotel 🍽️
Table Reserved!

${restaurantName}
${date} at ${time}
Guests: ${guests}
Ref: ${bookingRef}

See you at the restaurant!`;
};

/**
 * Feedback Request SMS Template
 */
const sendFeedbackRequestSMS = () => {
  return `Coconut Saraih Hotel 💭
Thank you for staying with us!

We'd love your feedback. Click below to share your experience:
coconutsaraih.com/feedback

It only takes 2 minutes!`;
};

/**
 * Special Offer SMS Template
 */
const sendSpecialOfferSMS = (offerTitle, discount, validity) => {
  return `Coconut Saraih Hotel 🌴
Special Offer!

${offerTitle}
Save ${discount}% OFF

Valid until: ${validity}

Book now: coconutsaraih.com
Use code: SPECIAL${Date.now().toString().slice(-4)}`;
};

/**
 * Loyalty Points SMS Template
 */
const sendLoyaltyPointsSMS = (points, totalPoints, tier) => {
  return `Coconut Saraih Hotel ⭐
You earned ${points} loyalty points!

Total: ${totalPoints} points
Tier: ${tier}

Earn more for exclusive rewards!
coconutsaraih.com/loyalty`;
};

/**
 * Booking Modification SMS Template
 */
const sendBookingModificationSMS = (bookingReference, modificationType) => {
  return `Coconut Saraih Hotel 🏨
Booking Updated

Ref: ${bookingReference}
Change: ${modificationType}

View details: coconutsaraih.com/bookings`;
};

/**
 * Late Check-out Approval SMS Template
 */
const sendLateCheckOutApprovalSMS = (bookingReference, newCheckOutTime) => {
  return `Coconut Saraih Hotel 🏨
Late Check-out Approved!

Ref: ${bookingReference}
New check-out: ${newCheckOutTime}

Enjoy your extra time!`;
};

/**
 * Late Check-out Rejection SMS Template
 */
const sendLateCheckOutRejectionSMS = (bookingReference) => {
  return `Coconut Saraih Hotel 🏨
Late Check-out Request

Ref: ${bookingReference}

Unfortunately, late check-out is not available due to occupancy.
Standard check-out remains 11:00 AM.

Thank you for understanding!`;
};

/**
 * No Show SMS Template
 */
const sendNoShowSMS = (bookingReference) => {
  return `Coconut Saraih Hotel 🏨
No Show Alert

Ref: ${bookingReference}

We noticed you didn't arrive. Please contact us if you need to reschedule.

We hope to welcome you soon!`;
};

/**
 * Early Check-out SMS Template
 */
const sendEarlyCheckOutSMS = (bookingReference) => {
  return `Coconut Saraih Hotel 🏨
Check-out Confirmed

Ref: ${bookingReference}

We hope you enjoyed your stay!
Check-out time: 11:00 AM

Safe travels and see you again! 🌴`;
};

/**
 * Room Ready SMS Template
 */
const sendRoomReadySMS = (roomNumber) => {
  return `Coconut Saraih Hotel 🏨
Your room is ready!

Room: ${roomNumber}
Floor: ${roomNumber.charAt(0)}

Enjoy your stay! 🌴`;
};

/**
 * Housekeeping Complete SMS Template
 */
const sendHousekeepingCompleteSMS = (roomNumber) => {
  return `Coconut Saraih Hotel 🏨
Room Service Complete

Room ${roomNumber} is fresh and ready!

Need anything else? Call ext. 0`;
};

/**
 * Airport Transfer SMS Template
 */
const sendAirportTransferSMS = (pickupTime, vehicleInfo, driverContact) => {
  return `Coconut Saraih Hotel 🚗
Airport Transfer

Pickup time: ${pickupTime}
Vehicle: ${vehicleInfo}
Driver: ${driverContact}

Safe travels! 🌴`;
};

/**
 * Event Reminder SMS Template
 */
const sendEventReminderSMS = (eventName, date, time, venue) => {
  return `Coconut Saraih Hotel 🎉
Event Reminder!

${eventName}
${date} at ${time}
Venue: ${venue}

We look forward to seeing you!`;
};

/**
 * Spa Booking Confirmation SMS Template
 */
const sendSpaBookingConfirmationSMS = (serviceName, date, time, bookingRef) => {
  return `Coconut Saraih Hotel 💆
Spa Appointment Confirmed!

${serviceName}
Date: ${date}
Time: ${time}
Ref: ${bookingRef}

Prepare to relax! 🌺`;
};

/**
 * General Notification SMS Template
 */
const sendGeneralNotificationSMS = (message) => {
  return `Coconut Saraih Hotel 🏨

${message}

Questions? Call +255 700 000 000`;
};

/**
 * Good Morning SMS Template (for in-house guests)
 */
const sendGoodMorningSMS = (guestName) => {
  return `Good morning, ${guestName}! 🌴

Welcome to Coconut Saraih Hotel!
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

Enjoy your breakfast and have a wonderful day!
Explore our activities at coconutsaraih.com/activities`;
};

/**
 * Late Night Guest Welcome SMS Template
 */
const sendLateNightWelcomeSMS = (guestName) => {
  return `Welcome to Coconut Saraih Hotel, ${guestName}! 🌴

Check-in complete! Room keys at front desk.

Restaurantly hours: 6 AM - 10 PM
Need assistance? Call ext. 0

Sweet dreams! 💤`;
};

module.exports = {
  sendWelcomeSMS,
  sendBookingConfirmationSMS,
  sendBookingCancellationSMS,
  sendPaymentConfirmationSMS,
  sendCheckInReminderSMS,
  sendCheckOutReminderSMS,
  sendPaymentDueSMS,
  sendOTPSMS,
  sendPasswordResetSMS,
  sendActivityConfirmationSMS,
  sendRestaurantReservationSMS,
  sendFeedbackRequestSMS,
  sendSpecialOfferSMS,
  sendLoyaltyPointsSMS,
  sendBookingModificationSMS,
  sendLateCheckOutApprovalSMS,
  sendLateCheckOutRejectionSMS,
  sendNoShowSMS,
  sendEarlyCheckOutSMS,
  sendRoomReadySMS,
  sendHousekeepingCompleteSMS,
  sendAirportTransferSMS,
  sendEventReminderSMS,
  sendSpaBookingConfirmationSMS,
  sendGeneralNotificationSMS,
  sendGoodMorningSMS,
  sendLateNightWelcomeSMS
};
