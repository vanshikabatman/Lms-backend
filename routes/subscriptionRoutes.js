const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Subscription = require('../models/subscriptionModel')



router.post('/create', authenticate, authorizeRole(['admin']), async (req, res) => {
    const { name, price, duration } = req.body;
    try {
        const subscription = new Subscription({
            plan: name, price: price, duration: duration
        });
        await subscription.save();
        res.status(201).json({ message: 'Subscription plan created successfully', subscription })
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({}).populate('includedCourses');
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
module.exports = router;