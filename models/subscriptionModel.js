const mongoose = require('mongoose');
const SubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true }, // Reference to the subscription plan
    startTime: { type: Date, required: true, default: Date.now }, // Subscription start time
    endTime: { type: Date,}, // Subscription end time
    status: { 
        type: String, 
        enum: ['active', 'expired', 'cancelled'], 
        default: 'active' 
    }, // Subscription status
    paymentId: { type: String }, // Reference to payment (if needed)
    isAutoRenew: { type: Boolean, default: false }, // For auto-renewal functionality
}, { timestamps: true });

SubscriptionSchema.pre('save', async function (next) {
    try {
        // Ensure the plan is populated to access its duration
        if (!this.endTime && this.plan && this.startTime) {
            // Fetch the plan details if not already populated
            if (!this.populated('plan')) {
                await this.populate('plan');
            }

            const planDuration = this.plan.duration; // Get duration in months
            if (!planDuration) {
                throw new Error('Plan duration is required to calculate the subscription end time.');
            }

            // Calculate and set the end time
            const endDate = new Date(this.startTime);
            endDate.setMonth(endDate.getMonth() + planDuration);
            this.endTime = endDate;
        }
        next();
    } catch (error) {
        next(error); // Pass errors to the save process
    }
});


module.exports = mongoose.model('Subscription', SubscriptionSchema);