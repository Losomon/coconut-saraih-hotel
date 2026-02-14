const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Booking = require('../../../models/Booking');
const Room = require('../../../models/Room');
const User = require('../../../models/User');
const { generateTestToken, createTestBooking, createTestRoom, createTestUser } = require('../../helpers');

describe('Bookings API Integration Tests', () => {
  let userToken;
  let adminToken;
  let testUser;
  let testRoom;

  beforeAll(async () => {
    userToken = generateTestToken({ userId: 'test-user-id', role: 'guest' });
    adminToken = generateTestToken({ userId: 'test-admin-id', role: 'admin' });
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await Room.deleteMany({});
    
    // Create test room
    testRoom = await Room.create(createTestRoom({ 
      roomNumber: '101', 
      status: 'available',
      price: 10000 
    }));
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await Room.deleteMany({});
  });

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await Booking.create([
        createTestBooking({ room: testRoom._id, status: 'confirmed' }),
        createTestBooking({ 
          room: testRoom._id, 
          checkIn: tomorrow,
          checkOut: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
          status: 'pending' 
        })
      ]);
    });

    it('should return all bookings with admin auth', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=confirmed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      response.body.data.forEach(booking => {
        expect(booking.status).toBe('confirmed');
      });
    });

    it('should return bookings for authenticated user', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/bookings/:id', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await Booking.create(createTestRoom({ 
        room: testRoom._id 
      }));
    });

    it('should return booking by id', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create booking with valid data', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const bookingData = {
        room: testRoom._id,
        checkIn: tomorrow.toISOString(),
        checkOut: dayAfter.toISOString(),
        guestCount: 2,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+254700000000',
        specialRequests: 'Late check-in'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.data.guestName).toBe('John Doe');
      expect(response.body.data.specialRequests).toBe('Late check-in');
    });

    it('should return 401 without auth', async () => {
      const bookingData = {
        room: testRoom._id,
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const invalidBooking = {
        guestCount: 2
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidBooking);

      expect(response.status).toBe(400);
    });

    it('should reject booking with past check-in date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();

      const bookingData = {
        room: testRoom._id,
        checkIn: yesterday.toISOString(),
        checkOut: today.toISOString(),
        guestCount: 2,
        guestName: 'John Doe',
        guestEmail: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
    });

    it('should reject booking with check-out before check-in', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const today = new Date();

      const bookingData = {
        room: testRoom._id,
        checkIn: tomorrow.toISOString(),
        checkOut: today.toISOString(),
        guestCount: 2,
        guestName: 'John Doe',
        guestEmail: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await Booking.create(createTestBooking({ 
        room: testRoom._id,
        status: 'confirmed' 
      }));
    });

    it('should update booking status with admin auth', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should allow guest to cancel their own booking', async () => {
      const userBooking = await Booking.create(createTestBooking({
        room: testRoom._id,
        guest: 'test-user-id',
        status: 'confirmed'
      }));

      const response = await request(app)
        .put(`/api/bookings/${userBooking._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'cancelled' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await Booking.create(createTestBooking({ 
        room: testRoom._id 
      }));
    });

    it('should delete booking with admin auth', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${testBooking._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);

      const deletedBooking = await Booking.findById(testBooking._id);
      expect(deletedBooking).toBeNull();
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${testBooking._id}`);

      expect(response.status).toBe(401);
    });
  });
});
