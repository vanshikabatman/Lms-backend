const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true }, // Reference to the subscription plan
    startTime: { type: Date, required: true, default: Date.now }, // Subscription start time
    endTime: { type: Date }, // Subscription end time
    status: { 
        type: String, 
        enum: ['active', 'expired', 'cancelled'], 
        default: 'active' 
    }, // Subscription status
    paymentId: { type: String }, // Reference to payment (if needed)
    isAutoRenew: { type: Boolean, default: false }, // For auto-renewal functionality
}, { timestamps: true });

// Automatically calculate endTime based on validity (days) of the plan
SubscriptionSchema.pre('save', async function (next) {
    try {
        if (!this.endTime && this.plan && this.startTime) {
            // Fetch the plan details if not already populated
            if (!this.populated('plan')) {
                await this.populate('plan');
            }

            const planValidity = this.plan.validity; // Get validity in days
            if (!planValidity) {
                throw new Error('Plan validity is required to calculate the subscription end time.');
            }

            // Calculate and set the end time
            const endDate = new Date(this.startTime);
            endDate.setDate(endDate.getDate() + planValidity); // Add validity days
            this.endTime = endDate;
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
