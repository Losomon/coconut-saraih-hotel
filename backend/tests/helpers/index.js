const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Generate a test JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration
 * @returns {string} Generated JWT token
 */
const generateTestToken = (payload = { userId: 'test-user-id', role: 'admin' }, secret = process.env.JWT_SECRET, expiresIn = '1h') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate a valid MongoDB ObjectId
 * @returns {string} MongoDB ObjectId
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

/**
 * Create a mock request object
 * @param {Object} params - Request parameters
 * @returns {Object} Mock request
 */
const createMockRequest = (params = {}) => ({
  params,
  body: {},
  query: {},
  headers: {},
  user: null,
  ...params
});

/**
 * Create a mock response object
 * @returns {Object} Mock response with jest functions
 */
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  return res;
};

/**
 * Create a mock next function
 * @returns {Function} Mock next function
 */
const createMockNext = () => jest.fn();

/**
 * Create a test user object
 * @param {Object} overrides - User properties to override
 * @returns {Object} Test user data
 */
const createTestUser = (overrides = {}) => ({
  _id: generateObjectId(),
  email: 'test@example.com',
  password: 'hashedPassword123',
  firstName: 'Test',
  lastName: 'User',
  role: 'guest',
  phone: '+254700000000',
  isActive: true,
  ...overrides
});

/**
 * Create a test room object
 * @param {Object} overrides - Room properties to override
 * @returns {Object} Test room data
 */
const createTestRoom = (overrides = {}) => ({
  _id: generateObjectId(),
  roomNumber: '101',
  type: 'standard',
  floor: 1,
  price: 10000,
  capacity: 2,
  amenities: ['wifi', 'tv'],
  status: 'available',
  description: 'Test room description',
  images: [],
  ...overrides
});

/**
 * Create a test booking object
 * @param {Object} overrides - Booking properties to override
 * @returns {Object} Test booking data
 */
const createTestBooking = (overrides = {}) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    _id: generateObjectId(),
    guest: generateObjectId(),
    room: generateObjectId(),
    checkIn: today,
    checkOut: tomorrow,
    totalPrice: 10000,
    status: 'confirmed',
    paymentStatus: 'paid',
    guestCount: 1,
    specialRequests: '',
    ...overrides
  };
};

/**
 * Create a test activity object
 * @param {Object} overrides - Activity properties to override
 * @returns {Object} Test activity data
 */
const createTestActivity = (overrides = {}) => ({
  _id: generateObjectId(),
  name: 'Test Activity',
  description: 'Test activity description',
  category: 'fitness',
  price: 5000,
  duration: 60,
  capacity: 20,
  schedule: {
    day: 'monday',
    startTime: '09:00',
    endTime: '10:00'
  },
  isActive: true,
  image: 'activity.jpg',
  ...overrides
});

/**
 * Create a test event object
 * @param {Object} overrides - Event properties to override
 * @returns {Object} Test event data
 */
const createTestEvent = (overrides = {}) => ({
  _id: generateObjectId(),
  title: 'Test Event',
  description: 'Test event description',
  type: 'corporate',
  date: new Date(),
  startTime: '10:00',
  endTime: '18:00',
  venue: 'Conference Hall',
  capacity: 100,
  price: 50000,
  organizer: 'Test Organizer',
  contactEmail: 'test@event.com',
  contactPhone: '+254700000000',
  isActive: true,
  images: [],
  ...overrides
});

/**
 * Wait for a specified duration
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise<void>}
 */
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to parse JSON response
 * @param {Object} response - Supertest response
 * @returns {Object} Parsed body
 */
const parseJSONResponse = (response) => {
  return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
};

module.exports = {
  generateTestToken,
  generateObjectId,
  createMockRequest,
  createMockResponse,
  createMockNext,
  createTestUser,
  createTestRoom,
  createTestBooking,
  createTestActivity,
  createTestEvent,
  waitFor,
  parseJSONResponse
};
