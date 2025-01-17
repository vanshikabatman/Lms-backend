const express = require('express');
const router = express.Router();
const State = require('../models/stateModel');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Add a new state
router.post('/add', authenticate, authorizeRole(['admin']), async (req, res) => {
  const { name, code, status } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required.' });
  }

  try {
    const newState = new State({ name, code, status });
    await newState.save();
    res.status(201).json(newState);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create state', error: err.message });
  }
});

// Get all states
router.get('/all', async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json(states);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get state by ID
router.get('/:id', async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ message: 'State not found' });
    res.status(200).json(state);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving state', error: err.message });
  }
});

// Delete state by ID
router.delete('/:id', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) return res.status(404).json({ message: 'State not found' });
    res.status(200).json({ message: 'State deleted successfully', data: state });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting state', error: err.message });
  }
});

module.exports = router;
