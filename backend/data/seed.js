const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Room Schema
const roomSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  price: Number,
  capacity: Number,
  amenities: [String],
  images: [String],
  available: Boolean,
  size: String
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  duration: String,
  price: Number,
  maxParticipants: Number,
  images: [String],
  available: Boolean,
  location: String
});

const Room = mongoose.model('Room', roomSchema);
const Activity = mongoose.model('Activity', activitySchema);

const seedRooms = [
  {
    name: "Deluxe Ocean View Suite",
    type: "suite",
    description: "Experience luxury with panoramic ocean views from your private balcony. Features a king-size bed, spacious living area, and premium amenities.",
    price: 450,
    capacity: 2,
    amenities: ["King Bed", "Ocean View", "Private Balcony", "Mini Bar", "Free Wi-Fi", "Air Conditioning", "Room Service", "Smart TV"],
    images: ["/assets/images/room-a.jpg"],
    available: true,
    size: "45 sqm"
  },
  {
    name: "Garden View Room",
    type: "standard",
    description: "A serene room overlooking the lush tropical gardens. Perfect for couples seeking a peaceful retreat.",
    price: 250,
    capacity: 2,
    amenities: ["Queen Bed", "Garden View", "Free Wi-Fi", "Air Conditioning", "Room Service", "Flat Screen TV"],
    images: ["/assets/images/b1.jpg"],
    available: true,
    size: "35 sqm"
  },
  {
    name: "Beachfront Villa",
    type: "villa",
    description: "Exclusive beachfront villa with direct beach access, private pool, and butler service for the ultimate luxury experience.",
    price: 850,
    capacity: 4,
    amenities: ["2 King Beds", "Private Pool", "Beachfront", "Butler Service", "Kitchenette", "Free Wi-Fi", "Air Conditioning"],
    images: ["/assets/images/a1.jpg"],
    available: true,
    size: "120 sqm"
  },
  {
    name: "Family Suite",
    type: "suite",
    description: "Spacious suite perfect for families, featuring separate living room and bedrooms with modern amenities.",
    price: 400,
    capacity: 4,
    amenities: ["2 Queen Beds", "Separate Living Room", "Free Wi-Fi", "Air Conditioning", "Kitchenette", "Room Service"],
    images: ["/assets/images/a2.jpg"],
    available: true,
    size: "65 sqm"
  },
  {
    name: "Honeymoon Suite",
    type: "suite",
    description: "Romantic suite with special touches including champagne, flower bath, and candlelight dinner options.",
    price: 550,
    capacity: 2,
    amenities: ["King Bed", "Jacuzzi", "Ocean View", "Champagne Welcome", "Flower Bath", "Free Wi-Fi"],
    images: ["/assets/images/a3.jpg"],
    available: true,
    size: "55 sqm"
  },
  {
    name: "Standard Twin Room",
    type: "standard",
    description: "Comfortable room with two twin beds, ideal for friends traveling together.",
    price: 180,
    capacity: 2,
    amenities: ["2 Twin Beds", "City View", "Free Wi-Fi", "Air Conditioning", "Flat Screen TV"],
    images: ["/assets/images/b2.jpg"],
    available: true,
    size: "30 sqm"
  }
];

const seedActivities = [
  {
    name: "Sunset Yoga Session",
    category: "wellness",
    description: "Start your evening with a rejuvenating yoga session on the beach as the sun sets over the Indian Ocean.",
    duration: "1 hour",
    price: 25,
    maxParticipants: 20,
    images: ["/assets/images/a4.jpg"],
    available: true,
    location: "Beach Front"
  },
  {
    name: "Snorkeling Adventure",
    category: "water",
    description: "Explore the vibrant marine life with our guided snorkeling adventure in crystal clear waters.",
    duration: "3 hours",
    price: 75,
    maxParticipants: 15,
    images: ["/assets/images/exp1.jpg"],
    available: true,
    location: "Marine Reserve"
  },
  {
    name: "Cultural Dance Show",
    category: "entertainment",
    description: "Experience traditional local dances and music performed by talented local artists.",
    duration: "1.5 hours",
    price: 35,
    maxParticipants: 100,
    images: ["/assets/images/exp2.jpg"],
    available: true,
    location: "Main Amphitheater"
  },
  {
    name: "Spa Treatment Package",
    category: "wellness",
    description: "Full body massage, facial, and body scrub using traditional and modern techniques.",
    duration: "2.5 hours",
    price: 150,
    maxParticipants: 5,
    images: ["/assets/images/spa (1).jpg"],
    available: true,
    location: "Hotel Spa Center"
  },
  {
    name: "Cooking Class",
    category: "culinary",
    description: "Learn to cook authentic local dishes with our expert chefs using fresh, local ingredients.",
    duration: "2 hours",
    price: 65,
    maxParticipants: 12,
    images: ["/assets/images/dining1.jpg"],
    available: true,
    location: "Hotel Kitchen"
  },
  {
    name: "Diving Expedition",
    category: "water",
    description: "Discover the underwater world with certified diving instructors. Suitable for beginners and experienced divers.",
    duration: "4 hours",
    price: 120,
    maxParticipants: 8,
    images: ["/assets/images/local-activities (1).jpg"],
    available: true,
    location: "Diving Center"
  },
  {
    name: "Nature Walk",
    category: "adventure",
    description: "Guided walk through the tropical forest to discover local flora and fauna.",
    duration: "2 hours",
    price: 30,
    maxParticipants: 15,
    images: ["/assets/images/local-activities (2).jpg"],
    available: true,
    location: "Nature Trail"
  },
  {
    name: "Kayaking",
    category: "water",
    description: "Paddle through mangroves and explore the coastline in a single or double kayak.",
    duration: "1.5 hours",
    price: 40,
    maxParticipants: 10,
    images: ["/assets/images/local-activities (3).jpg"],
    available: true,
    location: "Water Sports Center"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Room.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data');

    // Insert seed data
    await Room.insertMany(seedRooms);
    await Activity.insertMany(seedActivities);
    console.log('Seed data inserted successfully');

    console.log('Database seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
