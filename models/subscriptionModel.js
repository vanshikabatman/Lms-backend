const mongoose = require('mongoose');
const SubscriptionSchema = new mongoose.Schema({
    plan: { type: String, required: true },
    duration: { type: Number, required: true }, // In months
    price: { type: Number, required: true },
    includedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;