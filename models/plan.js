const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: { type: String, enum : ['Basic' , 'Premium' , 'Focused'], required: true }, // e.g., "Basic", "Premium"
    duration: { type: Number, required: true }, // Duration in months
    price: { type: Number, required: true }, // Price of the plan
    includedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Courses included in the plan
    description: { type: String }, // Optional description of the plan
    isActive: { type: Boolean, default: true }, // Indicates if the plan is currently active
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
