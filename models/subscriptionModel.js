const mongoose = require('mongoose');
const SubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true }, // Reference to the subscription plan
    startTime: { type: Date, required: true, default: Date.now }, // Subscription start time
    endTime: { type: Date, required: true }, // Subscription end time
    status: { 
        type: String, 
        enum: ['active', 'expired', 'cancelled'], 
        default: 'active' 
    }, // Subscription status
    paymentId: { type: String }, // Reference to payment (if needed)
    isAutoRenew: { type: Boolean, default: false }, // For auto-renewal functionality
}, { timestamps: true });

SubscriptionSchema.pre('save', function (next) {
    // Automatically calculate endTime based on the plan's duration
    if (!this.endTime && this.plan && this.startTime) {
        const endDate = new Date(this.startTime);
        endDate.setMonth(endDate.getMonth() + this.plan.duration);
        this.endTime = endDate;
    }
    next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);