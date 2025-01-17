const mongoose = require('mongoose');

const featuredCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  featuredAt: { type: Date, default: Date.now }
});

const FeaturedCourse = mongoose.model('FeaturedCourse', featuredCourseSchema);
module.exports = FeaturedCourse;