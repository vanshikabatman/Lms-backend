const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Subscription = require('../models/subscriptionModel')
const plans = require('../models/plan');
const Course = require('../models/course');
const Razorpay = require('razorpay');
const Transaction = require("../models/transactionModel");
const User = require("../models/user")
const { Exam } = require("../models/examModel")
const razorpay = new Razorpay({
    key_id: "rzp_test_Wm90I5h1isnZZk",
    key_secret: "oUAbzAdAHXFJp7nXQJ1p68YD",
});

router.post('/buy', authenticate, async (req, res) => {
    const { Id, type } = req.body;

    try {
        let item;
        let itemIdField;
        const user = await User.findById(req.user.id);

        if (type === 'plan') {
            item = await plans.findById(Id);
            if (!item) return res.status(404).json({ error: 'Subscription plan not found' });
            itemIdField = 'planId';
        }
        else if (type === 'course') {
            item = await Course.findById(Id);
            if (!item) return res.status(404).json({ error: 'Course not found' });

            if (user.purchasedCourses.includes(Id)) {
                return res.status(400).json({ message: 'Course already purchased.' });
            }
            itemIdField = 'courseId';
        } else if (type === 'exam') {
            item = await Exam.findById(Id);
            if (!item) return res.status(404).json({ error: 'Exam not found' });

            if (user.purchasedExams.includes(Id)) {
                return res.status(400).json({ message: 'Course already purchased.' });
            }
        }

        else {
            return res.status(400).json({ error: 'Invalid type provided. Must be either "plan" or "course".' });
        }
        // Create a Razorpay order
        console.log(item.price);
        const amountInPaise = Math.round(item.price * 100); // Razorpay uses paise
        console.log(amountInPaise);
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                itemId: item.id,
                type,
            }
        });

        // Save the pending transaction
        const transaction = new Transaction({
            orderId: order.id,
            userId: req.user.id,
            [itemIdField]: item.id,
            amount: item.price,
            timestamp: new Date(),
        });
        await transaction.save();

        res.status(200).json({
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

        // Fetch order details from Razorpay
        const order = await razorpay.orders.fetch(razorpay_order_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const userId = order.notes.userId;
        const itemId = order.notes.itemId;
        const type = order.notes.type;

        if (!userId || !itemId || !type) {
            return res.status(400).json({ error: 'Invalid order notes. Missing userId, itemId, or type.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let item;

        if (type === 'plan') {
            item = await plans.findById(itemId);
            if (!item) {
                return res.status(404).json({ error: 'Plan not found' });
            }

            const subscription = new Subscription({
                user: userId,
                plan: itemId,
                startTime: new Date(),
                status: 'active',
                paymentId: razorpay_payment_id,
            });
            await subscription.save();

            user.subscriptions.push(subscription._id);
            await user.save();

            await Transaction.findOneAndUpdate(
                { orderId: order.id },
                { $set: { status: order.status } }
            );

            return res.status(200).json({ message: 'Plan subscribed successfully.', subscription , type: 'plan'}); 
        } else if (type === 'course') {
            item = await Course.findById(itemId);
            if (!item) {
                return res.status(404).json({ error: 'Course not found' });
            }

            if (user.purchasedCourses.includes(itemId)) {
                return res.status(400).json({ message: 'Course already purchased.' });
            }

            user.purchasedCourses.push(itemId);
            await user.save();

            await Transaction.findOneAndUpdate(
                { orderId: order.id },
                { $set: { status: order.status } }
            );

            return res.status(200).json({ message: 'Course purchased successfully.', course: item , type: 'course'});
        } else if (type === 'exam') {
            item = await Exam.findById(itemId);
            if (!item) {
                return res.status(404).json({ error: 'ExamID not found' });
            }

            if (user.purchasedExams.includes(itemId)) {
                return res.status(400).json({ message: 'Exam already purchased.' });
            }

            user.purchasedExams.push(itemId);
            await user.save();

            await Transaction.findOneAndUpdate(
                { orderId: order.id },
                { $set: { status: order.status } }
            );

            return res.status(200).json({ message: 'Course purchased successfully.', exam: {
                _id: item._id,
                name: item.name,
                isPurchased: true
                
            } , type: 'exam'});
        } 
        
        else {
            return res.status(400).json({ error: 'Invalid type provided. Must be either "plan" or "course".' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

router.post('/webhook', async (req, res) => {
    const { order_id, payment_id } = req.body;
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

router.get('/admin/transactions', authenticate, authorizeRole(['admin']), async (req, res) => {
    try {
        // Fetch all transactions from the database
        const transactions = await Transaction.find().populate('userId planId').sort({ timestamp: -1 });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found.' });
        }

        res.status(200).json({
            message: 'Transaction history fetched successfully.',
            transactions,
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

module.exports = router;