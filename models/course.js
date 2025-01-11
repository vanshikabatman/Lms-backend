// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  priceWithDiscount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  image: { type: String, required: true },
  thumbnail: { type: String, required: true },
  type: { type: String, required: true },
  link: { type: String },
  duration: { type: Number, required: true },
  category: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentsCount: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  progressPercent: { type: Number, default: 0 },
  reservedMeeting: { type: String },
  reservedMeetingUserTimeZone: { type: String },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date },
  expireOn: { type: Date },
  capacity: { type: Number },
  badges: [{ type: String }],
  translations: [{ language: String, title: String, description: String }],
//   activeSpecialOffer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'SpecialOffer',
//   },
  authHasBought: { type: Boolean, default: false },
//   sales: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Sales',
//   },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
