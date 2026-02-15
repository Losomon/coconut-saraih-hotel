# Saraih Hotel

A comprehensive hotel management system for Coconut Saraih Hotel.

## Project Overview

**Project Name:** Saraih Hotel  
**Version:** 1.0.0  
**Type:** Full-stack Web Application

Saraih Hotel is a complete hotel management solution featuring room bookings, restaurant reservations, event management, spa services, and comprehensive administrative controls.

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MongoDB
- Redis (Caching)
- Socket.io (Real-time features)

## Features

### Guest Features
- Room browsing and booking
- Restaurant reservations
- Event browsing and booking
- Spa service booking
- Multi-language support (English, Swahili, French, Arabic)
- Guest account management
- Booking cart and checkout
- Payment processing

### Admin Features
- Room management
- Booking management with calendar view
- Guest management
- Staff management
- Restaurant menu management
- Event hall management
- Housekeeping status tracking
- Payment and refund management
- Analytics and reporting
- Real-time notifications

## Project Structure

```
├── backend/           # Node.js backend API
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── middleware/   # Express middleware
│   ├── socket/       # Socket.io handlers
│   ├── utils/        # Utility functions
│   ├── validators/   # Input validation
│   ├── jobs/         # Background jobs
│   └── tests/        # Test files
│
├── frontend/         # Frontend files
│   ├── admin/       # Admin dashboard pages
│   └── src/         # JavaScript and styles
│
└── project.json     # Project configuration
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the backend server:
```bash
npm run dev
```

4. Open frontend:
```bash
# Simply open frontend/index.html in a browser
# Or use a local server
npx serve frontend
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout

### Rooms
- GET `/api/rooms` - List all rooms
- GET `/api/rooms/:id` - Get room details
- POST `/api/rooms` - Create room (admin)
- PUT `/api/rooms/:id` - Update room (admin)
- DELETE `/api/rooms/:id` - Delete room (admin)

### Bookings
- GET `/api/bookings` - List bookings
- POST `/api/bookings` - Create booking
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking

### Restaurants
- GET `/api/restaurants` - List restaurants
- GET `/api/restaurants/:id` - Restaurant details
- POST `/api/restaurants` - Create restaurant (admin)
- POST `/api/restaurants/:id/reserve` - Make reservation

### Events
- GET `/api/events` - List events
- GET `/api/events/:id` - Event details
- POST `/api/events` - Create event (admin)
- POST `/api/events/:id/book` - Book event

### Payments
- POST `/api/payments` - Process payment
- GET `/api/payments/:id` - Get payment status
- POST `/api/payments/:id/refund` - Refund payment

## Multi-language Support

The system supports multiple languages:
- English (en)
- Swahili (sw)
- French (fr)
- Arabic (ar)

Language can be changed via the frontend interface or by setting the `Accept-Language` header in API requests.

## Real-time Features

- Booking confirmations
- Notification alerts
- Chat support
- Live availability updates

## License

Proprietary - All rights reserved
