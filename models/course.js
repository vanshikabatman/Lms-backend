// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: function() { return !this.isFree; } }, // Required only if not free
  isFree: { type: Boolean, default: false }, // Courses marked as free
  priceWithDiscount: { type: Number, default: 0 }, // Discounted price
  discountPercent: { type: Number, default: 0 }, // Discount percentage
  image: { type: String, required: true }, // Cover image URL
  thumbnail: { type: String, required: true }, // Thumbnail image URL
  type: { type: String, required: true }, // Type of course, e.g., "video", "live", "document"
  link: { type: String }, // Link to course material, e.g., video or hosted files
  duration: { type: Number, required: true }, // Duration in minutes
  category: { type: String }, // Course category
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Instructor reference
  studentsCount: { type: Number, default: 0 }, // Number of students enrolled
  reviewsCount: { type: Number, default: 0 }, // Total reviews count
  rating: { type: Number, default: 0 }, // Average rating
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Course status
  progressPercent: { type: Number, default: 0 }, // Progress of the course (if applicable)
  reservedMeeting: { type: String }, // Reserved meeting details (optional)
  reservedMeetingUserTimeZone: { type: String }, // User's timezone for meeting
  startDate: { type: Date }, // Start date for the course
  expireOn: { type: Date }, // Expiry date for the course
  capacity: { type: Number }, // Maximum number of students allowed
  badges: [{ type: String }], // Achievements or tags associated with the course
  translations: [{ 
    language: String, 
    title: String, 
    description: String 
  }], // Multilingual support
  authHasBought: { type: Boolean, default: false }, // Flag for purchase status (context-specific)
  subscriptionIncluded: { type: Boolean, default: false }, // Flag if included in a subscription plan
  createdAt: { type: Date, default: Date.now }, // Creation timestamp
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);


