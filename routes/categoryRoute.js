const express = require('express');
const router = express.Router();
const Category = require('../models/categoryModel');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Add a new category
router.post('/add', authenticate, authorizeRole(['admin']), async (req, res) => {
  const { name, collegeIds, keyword, description } = req.body;

  if (!name || !keyword) {
    return res.status(400).json({ message: 'Name and keyword are required.' });
  }

  try {
    const newCategory = new Category({ name, collegeIds, keyword, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
});

// Get all categories
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find().populate('collegeIds');
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('collegeIds');
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving category', error: err.message });
  }
});

// Delete category by ID
router.delete('/:id', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted successfully', data: category });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
});

module.exports = router;
