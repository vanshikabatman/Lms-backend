const express = require('express');
const router = express.Router();
const College = require('../models/collegeModel');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Add a new college
router.post('/add', authenticate, authorizeRole(['admin']), async (req, res) => {
  const { name, state, region, thumbnail } = req.body;

  if (!name || !state || !region) {
    return res.status(400).json({ message: 'Name, state, and region are required.' });
  }

  try {
    const newCollege = new College({ name, state, region, thumbnail });
    await newCollege.save();
    res.status(201).json(newCollege);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create college', error: err.message });
  }
});

// Get all colleges
router.get('/all', async (req, res) => {
  try {
    const colleges = await College.find().populate('state');
    res.status(200).json(colleges);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get college by ID
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate('state');
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.status(200).json(college);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving college', error: err.message });
  }
});

// Delete college by ID
router.delete('/:id', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.status(200).json({ message: 'College deleted successfully', data: college });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting college', error: err.message });
  }
});

module.exports = router;
