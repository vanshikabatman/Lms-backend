const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Subscription = require('../models/subscriptionModel')
const plans = require('../models/plan');
const Razorpay = require('razorpay');
const Transaction = require("../models/transactionModel");
const User = require("../models/user")
const razorpay = new Razorpay({
    key_id: "rzp_test_Wm90I5h1isnZZk",
    key_secret: "oUAbzAdAHXFJp7nXQJ1p68YD",
});

router.post('/buyPlan', authenticate, authorizeRole(['student']), async (req, res) => {
    const { planId } = req.body;

    try {
        // Fetch the subscription plan
        const plan = await plans.findById(planId);
        if (!plan) return res.status(404).json({ error: 'Subscription plan not found' });

        // Create a Razorpay order
        const amountInPaise = plan.price * 100; // Razorpay uses paise
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId : req.user.id,
                planId : planId
            }
        });

        // Save the pending transaction
        const transaction = new Transaction({
            orderId: order.id,
            userId: req.user.id,
            planId,
            amount: plan.price,
            timestamp: new Date(),
        });
        await transaction.save();

        res.status(200).json({
            message: 'Order created successfully',
            orderId: order.id,
            amount: plan.price,
            currency: 'INR',
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
router.post('/verify', authenticate, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const crypto = require('crypto');
        const generatedSignature = crypto
            .createHmac('sha256', 'oUAbzAdAHXFJp7nXQJ1p68YD') // Replace with your Razorpay Secret
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update the user's subscription
        const order = await razorpay.orders.fetch(razorpay_order_id); 
        const userId = order.notes.userId;
        const planId = order.notes.planId;
        console.log(req.user);
        console.log(order);
        await Transaction.findOneAndUpdate(
            { orderId: order.id },
            { $set: { status: order.status} }
        );

        await User.findByIdAndUpdate(userId, { subscription: planId });
        res.status(200).json({ message: 'Payment verified and subscription updated successfully' });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/webhook', async (req, res) => {
    const {order_id, payment_id} = req.body;  
    const webhookSecret = 'amar2002'; // Set this in Razorpay dashboard
    const signature = req.headers['x-razorpay-signature'];

    try {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(order_id + "|" + payment_id)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const { payload } = req.body;
        if (payload && payload.payment && payload.payment.entity.status === 'captured') {
            const { notes } = payload.payment.entity;

            // Mark transaction as complete
            await Transaction.findOneAndUpdate(
                { userId: notes.userId, planId: notes.planId },
                { $set: { status: 'paid' } }
            );

            // Update user subscription
            await User.findByIdAndUpdate(notes.userId, { subscription: notes.planId });

            res.status(200).json({ message: 'Payment verified and subscription updated' });
        } else {
            res.status(400).json({ error: 'Payment not captured' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
module.exports = router;