const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Room = require('../../../models/Room');
const { generateTestToken, createTestRoom } = require('../../helpers');

describe('Rooms API Integration Tests', () => {
  let authToken;
  let adminToken;

  beforeAll(async () => {
    // Create tokens for testing
    authToken = generateTestToken({ userId: 'test-user', role: 'guest' });
    adminToken = generateTestToken({ userId: 'test-admin', role: 'admin' });
  });

  afterAll(async () => {
    // Clean up database
    await Room.deleteMany({});
  });

  describe('GET /api/rooms', () => {
    beforeEach(async () => {
      await Room.deleteMany({});
      
      // Create test rooms
      await Room.create([
        createTestRoom({ roomNumber: '101', type: 'standard', price: 10000, status: 'available' }),
        createTestRoom({ roomNumber: '102', type: 'deluxe', price: 15000, status: 'available' }),
        createTestRoom({ roomNumber: '103', type: 'suite', price: 25000, status: 'occupied' })
      ]);
    });

    it('should return all rooms without auth', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter rooms by type', async () => {
      const response = await request(app)
        .get('/api/rooms?type=standard')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter rooms by status', async () => {
      const response = await request(app)
        .get('/api/rooms?status=available')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      response.body.data.forEach(room => {
        expect(room.status).toBe('available');
      });
    });

    it('should filter rooms by price range', async () => {
      const response = await request(app)
        .get('/api/rooms?minPrice=10000&maxPrice=15000')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      response.body.data.forEach(room => {
        expect(room.price).toBeGreaterThanOrEqual(10000);
        expect(room.price).toBeLessThanOrEqual(15000);
      });
    });

    it('should return pagination metadata', async () => {
      const response = await request(app)
        .get('/api/rooms?page=1&limit=2')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/rooms/:id', () => {
    let testRoom;

    beforeEach(async () => {
      await Room.deleteMany({});
      testRoom = await Room.create(createTestRoom({ 
        roomNumber: '201', 
        type: 'deluxe',
        price: 20000 
      }));
    });

    it('should return room by id', async () => {
      const response = await request(app)
        .get(`/api/rooms/${testRoom._id}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data.roomNumber).toBe('201');
    });

    it('should return 404 for non-existent room', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/rooms/${fakeId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid room id', async () => {
      const response = await request(app)
        .get('/api/rooms/invalid-id')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/rooms', () => {
    afterEach(async () => {
      await Room.deleteMany({});
    });

    it('should create room with admin auth', async () => {
      const newRoom = {
        roomNumber: '301',
        type: 'suite',
        floor: 3,
        price: 30000,
        capacity: 4,
        amenities: ['wifi', 'tv', 'mini-bar'],
        description: 'Luxury suite'
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoom)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.data.roomNumber).toBe('301');
      expect(response.body.data.type).toBe('suite');
    });

    it('should return 401 without auth', async () => {
      const newRoom = {
        roomNumber: '302',
        type: 'standard',
        floor: 1,
        price: 10000
      };

      const response = await request(app)
        .post('/api/rooms')
        .send(newRoom);

      expect(response.status).toBe(401);
    });

    it('should return 403 with guest auth', async () => {
      const newRoom = {
        roomNumber: '303',
        type: 'standard',
        floor: 1,
        price: 10000
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRoom);

      expect(response.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const invalidRoom = {
        floor: 1
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidRoom);

      expect(response.status).toBe(400);
    });

    it('should not create duplicate room number', async () => {
      const room = createTestRoom({ roomNumber: 'duplicate-test' });
      await Room.create(room);

      const duplicateRoom = {
        roomNumber: 'duplicate-test',
        type: 'standard',
        floor: 1,
        price: 10000
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateRoom);

      expect(response.status).toBe(409);
    });
  });

  describe('PUT /api/rooms/:id', () => {
    let testRoom;

    beforeEach(async () => {
      await Room.deleteMany({});
      testRoom = await Room.create(createTestRoom({ roomNumber: '401' }));
    });

    it('should update room with admin auth', async () => {
      const updateData = {
        price: 15000,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data.price).toBe(15000);
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent room', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/rooms/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 15000 });

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .put(`/api/rooms/${testRoom._id}`)
        .send({ price: 15000 });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    let testRoom;

    beforeEach(async () => {
      await Room.deleteMany({});
      testRoom = await Room.create(createTestRoom({ roomNumber: '501' }));
    });

    it('should delete room with admin auth', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);

      // Verify room is deleted
      const deletedRoom = await Room.findById(testRoom._id);
      expect(deletedRoom).toBeNull();
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${testRoom._id}`);

      expect(response.status).toBe(401);
    });

    it('should return 403 with guest auth', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
