const mongoose = require('mongoose');
const Room = require('../../../models/Room');

describe('Room Model Unit Tests', () => {
  describe('Room Schema Validation', () => {
    it('should create a valid room instance', async () => {
      const roomData = {
        roomNumber: '101',
        type: 'standard',
        floor: 1,
        price: 10000,
        capacity: 2,
        amenities: ['wifi', 'tv'],
        status: 'available',
        description: 'A cozy standard room'
      };

      const room = new Room(roomData);
      const savedRoom = await room.save();

      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.roomNumber).toBe('101');
      expect(savedRoom.type).toBe('standard');
      expect(savedRoom.floor).toBe(1);
      expect(savedRoom.price).toBe(10000);
      expect(savedRoom.capacity).toBe(2);
      expect(savedRoom.status).toBe('available');
    });

    it('should require roomNumber field', async () => {
      const room = new Room({
        type: 'standard',
        floor: 1,
        price: 10000
      });

      await expect(room.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require type field', async () => {
      const room = new Room({
        roomNumber: '102',
        floor: 1,
        price: 10000
      });

      await expect(room.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require price field', async () => {
      const room = new Room({
        roomNumber: '103',
        type: 'deluxe',
        floor: 1
      });

      await expect(room.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should set default status to available', async () => {
      const room = new Room({
        roomNumber: '104',
        type: 'suite',
        floor: 2,
        price: 20000,
        capacity: 2
      });

      const savedRoom = await room.save();
      expect(savedRoom.status).toBe('available');
    });

    it('should set default capacity to 1', async () => {
      const room = new Room({
        roomNumber: '105',
        type: 'standard',
        floor: 1,
        price: 10000
      });

      const savedRoom = await room.save();
      expect(savedRoom.capacity).toBe(1);
    });

    it('should accept valid room types', async () => {
      const validTypes = ['standard', 'deluxe', 'suite', 'family', 'presidential'];
      
      for (const type of validTypes) {
        const room = new Room({
          roomNumber: `room-${type}`,
          type,
          floor: 1,
          price: 10000,
          capacity: 2
        });
        
        const savedRoom = await room.save();
        expect(savedRoom.type).toBe(type);
        await Room.deleteOne({ _id: savedRoom._id });
      }
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
      
      for (const status of validStatuses) {
        const room = new Room({
          roomNumber: `room-${status}`,
          type: 'standard',
          floor: 1,
          price: 10000,
          status
        });
        
        const savedRoom = await room.save();
        expect(savedRoom.status).toBe(status);
        await Room.deleteOne({ _id: savedRoom._id });
      }
    });

    it('should have amenities as array with default empty array', async () => {
      const room = new Room({
        roomNumber: '106',
        type: 'standard',
        floor: 1,
        price: 10000
      });

      const savedRoom = await room.save();
      expect(savedRoom.amenities).toEqual([]);
    });

    it('should populate amenities when provided', async () => {
      const amenities = ['wifi', 'tv', 'air-conditioning', 'mini-bar'];
      
      const room = new Room({
        roomNumber: '107',
        type: 'deluxe',
        floor: 2,
        price: 15000,
        amenities
      });

      const savedRoom = await room.save();
      expect(savedRoom.amenities).toEqual(amenities);
    });

    it('should have images array with default empty array', async () => {
      const room = new Room({
        roomNumber: '108',
        type: 'suite',
        floor: 3,
        price: 25000
      });

      const savedRoom = await room.save();
      expect(savedRoom.images).toEqual([]);
    });
  });

  describe('Room Model Indexes', () => {
    it('should have unique roomNumber index', async () => {
      const room1 = new Room({
        roomNumber: 'unique-test',
        type: 'standard',
        floor: 1,
        price: 10000
      });
      
      await room1.save();
      
      const room2 = new Room({
        roomNumber: 'unique-test',
        type: 'deluxe',
        floor: 2,
        price: 15000
      });

      await expect(room2.save()).rejects.toThrow(mongoose.Error.MongoServerError);
      
      await Room.deleteOne({ roomNumber: 'unique-test' });
    });

    it('should have compound index on type and status', async () => {
      const indexes = Room.schema.indexes();
      const hasCompoundIndex = indexes.some(index => {
        const keys = Object.keys(index[0]);
        return keys.includes('type') && keys.includes('status');
      });
      
      expect(hasCompoundIndex).toBe(true);
    });
  });
});
