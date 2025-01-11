const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    amount: Number,
    timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;