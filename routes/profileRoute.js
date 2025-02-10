const express = require('express');
const router = express.Router();
const College = require('../models/collegeModel');
const Category = require('../models/categoryModel');

router.get('/' , async (req,res) => {
    res.status(200).json({ message: 'Profile route' });
});

router.get('/loadData', async (req, res) => {
    try {
        const colleges = await College.find();
        const categories = await Category.find();

        // Extract only names
        const collegeNames = colleges.map(college => college.name);
        const categoryNames = categories.map(category => category.name);

        res.status(200).json({ colleges: collegeNames, categories: categoryNames });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router;