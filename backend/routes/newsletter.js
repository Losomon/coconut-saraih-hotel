const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  getStats
} = require('../controllers/newsletter.controller');

// Public routes
router.post('/', subscribe);
router.put('/unsubscribe', unsubscribe);

// Admin routes
router.get('/', protect, authorize('admin'), getSubscribers);
router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
