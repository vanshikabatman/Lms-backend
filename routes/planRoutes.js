const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Plan = require("../models/plan")



// Middleware for validating request body
const validatePlan = (req, res, next) => {
    const { name, price, duration, validity } = req.body;

    if (!name || !price || !duration || !validity) {
        return res.status(400).json({ error: 'Missing required fields: name, price, and duration are required.' });
    }

    // if (!['Basic', 'Premium', 'Focused'].includes(name)) {
    //     return res.status(400).json({ error: 'Invalid plan name. Must be one of: Basic, Premium, Focused.' });
    // }

    next();
};

// POST: Create a new subscription plan
router.post(
    '/create',
    authenticate,
    authorizeRole(['admin']),
    validatePlan,
    async (req, res) => {
        const { name, price, duration, description , thumbnail  , validity} = req.body;

        try {
            const plan = new Plan({
               name: name,
               thumbnail: thumbnail,
                price: price,
                duration :duration,
                description: description,
                validity: validity,

            });

            await plan.save();

            res.status(201).json({
                message: 'Subscription plan created successfully.',
                plan,
            });
        } catch (err) {
            res.status(500).json({
                error: 'Failed to create subscription plan.',
                details: err.message,
            });
        }
    }
);

// GET: Retrieve all subscription plans
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find({})
            .populate('includedCourses') // Populate specific fields from related courses
            .exec();

        res.status(200).json({
            message: 'Subscription plans retrieved successfully.',
            plans,
        });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to retrieve subscription plans.',
            details: err.message,
        });
    }
});
module.exports = router;