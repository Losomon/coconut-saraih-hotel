const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const TableReservation = require('../models/TableReservation');
const { protect } = require('../middleware/auth');

// Menu Routes
router.get('/menu', async (req, res) => {
  try {
    const { category, available, dietary } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (available !== undefined) query.available = available === 'true';
    if (dietary) query.dietary = dietary;

    const menuItems = await MenuItem.find(query);
    res.json({ success: true, count: menuItems.length, menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/menu', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/menu/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Table Reservation Routes
router.get('/reservations', protect, async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (date) query.date = { $eq: new Date(date) };

    const reservations = await TableReservation.find(query).sort({ date: 1, time: 1 });
    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reservations', async (req, res) => {
  try {
    const reservation = await TableReservation.create(req.body);
    res.status(201).json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/reservations/:id', protect, async (req, res) => {
  try {
    const reservation = await TableReservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
