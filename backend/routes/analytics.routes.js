const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard metrics
// @access  Private (Admin/Manager)
router.get('/dashboard', protect, analyticsController.getDashboard);

// @route   GET /api/analytics/occupancy
// @desc    Get occupancy reports
// @access  Private (Admin)
router.get('/occupancy', protect, analyticsController.getOccupancyReport);

// @route   GET /api/analytics/revenue
// @desc    Get revenue reports
// @access  Private (Admin)
router.get('/revenue', protect, analyticsController.getRevenueReport);

// @route   GET /api/analytics/bookings
// @desc    Get booking analytics
// @access  Private (Admin)
router.get('/bookings', protect, analyticsController.getBookingAnalytics);

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private (Admin)
router.get('/export', protect, analyticsController.exportData);

module.exports = router;
