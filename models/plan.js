const mongoose = require('mongoose');
const PlanSchema = new mongoose.Schema({
    name: { 
        type: String, 
        // enum: ['Basic', 'Premium', 'Focused'], 
        required: true 
    }, // e.g., "Basic", "Premium"
    thumbnail : {
        type: String,
        required: true,
        default: "https://via.placeholder.com/150"
    },
    duration: { 
        type: Number, 
        required: true, 
        min: 1 
    }, // Duration in months (ensuring it's at least 1)

    price: { 
        type: Number, 
        required: true, 
        min: 0 
    }, // Ensuring price is non-negative

    includedCourses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    }], // Courses included in the plan

    description: { 
        type: String, 
        trim: true 
    }, // Optional description with trimming

    isActive: { 
        type: Boolean, 
        default: true, 
        index: true 
    }, // Indexed for faster lookups

    validity: { 
        type: Number, 
        default: 30, 
        min: 1 
    } // Number of days the plan is valid

}, { timestamps: true });



module.exports = mongoose.model('Plan', PlanSchema);
