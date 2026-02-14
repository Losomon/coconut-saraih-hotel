const express = require('express');
const router = express.Router();
const spaController = require('../controllers/spa.controller');
const { protect } = require('../middleware/auth');

// @route   GET /api/spa/services
// @desc    Get all spa services
// @access  Public
router.get('/services', spaController.getAllServices);

// @route   GET /api/spa/services/:id
// @desc    Get spa service by ID
// @access  Public
router.get('/services/:id', spaController.getService);

// @route   POST /api/spa/services
// @desc    Create spa service
// @access  Private (Admin)
router.post('/services', protect, spaController.createService);

// @route   PUT /api/spa/services/:id
// @desc    Update spa service
// @access  Private (Admin)
router.put('/services/:id', protect, spaController.updateService);

// @route   GET /api/spa/availability
// @desc    Check therapist availability
// @access  Public
router.get('/availability', spaController.checkAvailability);

// @route   POST /api/spa/bookings
// @desc    Book spa service
// @access  Private
router.post('/bookings', protect, spaController.bookService);

// @route   GET /api/spa/categories
// @desc    Get spa categories
// @access  Public
router.get('/categories', spaController.getCategories);

module.exports = router;
