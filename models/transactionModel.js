const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    orderId : String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    amount: Number,
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
