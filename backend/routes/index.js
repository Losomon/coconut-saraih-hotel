const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const roomRoutes = require('./rooms');
const activityRoutes = require('./activities');
const bookingRoutes = require('./bookings');
const guestRoutes = require('./guests');
const restaurantRoutes = require('./restaurant');
const eventRoutes = require('./events');
const staffRoutes = require('./staff');
const paymentRoutes = require('./payments');
const feedbackRoutes = require('./feedback');
const contactRoutes = require('./contact');
const spaRoutes = require('./spa.routes');
const analyticsRoutes = require('./analytics.routes');
const notificationRoutes = require('./notification.routes');
const newsletterRoutes = require('./newsletter');

// Define routes
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/activities', activityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/guests', guestRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/events', eventRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/contact', contactRoutes);
router.use('/spa', spaRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/newsletter', newsletterRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Coconut Saraih Hotel API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
