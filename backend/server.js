const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

// Route imports
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const activityRoutes = require('./routes/activities');
const bookingRoutes = require('./routes/bookings');
const guestRoutes = require('./routes/guests');
const restaurantRoutes = require('./routes/restaurant');
const eventRoutes = require('./routes/events');
const staffRoutes = require('./routes/staff');
const paymentRoutes = require('./routes/payments');
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');
const spaRoutes = require('./routes/spa.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const apiRoutes = require('./routes/index');

dotenv.config();
connectDB();
connectRedis();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/spa', spaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// API aggregator route (alternative access)
app.use('/api/v1', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Coconut Saraih Hotel API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Coconut Saraih Hotel API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
