const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { protect } = require('../middleware/auth');

// @route   GET /api/staff
// @desc    Get all staff
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { role, department, status } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;

    const staff = await Staff.find(query).sort({ lastName: 1 });
    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/staff/:id
// @desc    Get single staff member
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/staff
// @desc    Create staff member
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/staff/:id/status
// @desc    Update staff status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await Staff.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
