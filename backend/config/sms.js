/**
 * SMS Service Configuration
 */

const config = require('./index');

let twilioClient = null;
let africaTalkingClient = null;

/**
 * Initialize Twilio client
 */
const initializeTwilio = () => {
  const twilioConfig = config.sms.twilio;
  
  if (!twilioConfig.accountSid || !twilioConfig.authToken) {
    console.warn('Twilio credentials not configured');
    return null;
  }

  try {
    twilioClient = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken);
    console.log('Twilio client initialized');
    return twilioClient;
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error.message);
    return null;
  }
};

/**
 * Initialize Africa Talking client
 */
const initializeAfricaTalking = () => {
  const atConfig = config.sms.africaTalking;
  
  if (!atConfig.username || !atConfig.apiKey) {
    console.warn('Africa Talking credentials not configured');
    return null;
  }

  try {
    const AT = require('africastalking');
    africaTalkingClient = AT.init({
      username: atConfig.username,
      apiKey: atConfig.apiKey
    });
    console.log('Africa Talking client initialized');
    return africaTalkingClient;
  } catch (error) {
    console.error('Failed to initialize Africa Talking client:', error.message);
    return null;
  }
};

/**
 * Get Twilio client
 */
const getTwilioClient = () => twilioClient;

/**
 * Get Africa Talking client
 */
const getAfricaTalkingClient = () => africaTalkingClient;

/**
 * Send SMS via Twilio
 */
const sendSMSViaTwilio = async (to, message) => {
  if (!twilioClient) {
    console.error('Twilio client not initialized');
    return { success: false, error: 'SMS service not available' };
  }

  try {
    // Format phone number
    const formattedNumber = formatPhoneNumber(to);
    
    const result = await twilioClient.messages.create({
      body: message,
      from: config.sms.twilio.phoneNumber,
      to: formattedNumber
    });

    console.log(`SMS sent via Twilio: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS via Africa Talking
 */
const sendSMSViaAfricaTalking = async (to, message) => {
  if (!africaTalkingClient) {
    console.error('Africa Talking client not initialized');
    return { success: false, error: 'SMS service not available' };
  }

  try {
    const sms = africaTalkingClient.SMS;
    
    const result = await sms.send({
      to: [formatPhoneNumber(to)],
      message: message
    });

    console.log('SMS sent via Africa Talking:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Africa Talking SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Unified send SMS function
 */
const sendSMS = async (to, message, provider = 'twilio') => {
  if (provider === 'africatalking') {
    return sendSMSViaAfricaTalking(to, message);
  }
  return sendSMSViaTwilio(to, message);
};

/**
 * Format phone number for Kenya
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle various formats
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return `+254${cleaned}`;
  }
  
  return `+${cleaned}`;
};

/**
 * SMS Template generators
 */
const smsTemplates = {
  bookingConfirmation: (booking) => 
    `Coconut Saraih Hotel: Your booking ${booking.bookingReference} is confirmed! Check-in: ${new Date(booking.checkIn).toLocaleDateString()}. Thank you!`,

  paymentReceived: (amount, currency) => 
    `Coconut Saraih Hotel: Payment of ${currency} ${amount.toFixed(2)} received. Thank you!`,

  checkInReminder: (booking) => 
    `Coconut Saraih Hotel: Reminder - Your check-in is tomorrow (${new Date(booking.checkIn).toLocaleDateString()}). We look forward to seeing you!`,

  checkOutReminder: (booking) => 
    `Coconut Saraih Hotel: Check-out reminder. Please vacate your room by 11:00 AM. Thank you for staying with us!`,

  otpVerification: (otp, expiryMinutes) => 
    `Coconut Saraih Hotel: Your verification code is ${otp}. Valid for ${expiryMinutes} minutes. Don't share this code.`,

  bookingCancellation: (bookingRef) => 
    `Coconut Saraih Hotel: Your booking ${bookingRef} has been cancelled. We hope to see you again soon!`
};

/**
 * Initialize SMS services
 */
const initializeSMS = () => {
  initializeTwilio();
  initializeAfricaTalking();
};

module.exports = {
  initializeSMS,
  initializeTwilio,
  initializeAfricaTalking,
  getTwilioClient,
  getAfricaTalkingClient,
  sendSMS,
  sendSMSViaTwilio,
  sendSMSViaAfricaTalking,
  formatPhoneNumber,
  smsTemplates
};
