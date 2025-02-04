// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const course = require('./course');
const Subscription = require('./subscriptionModel');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
      type: String, 
      enum: ['student', 'admin', 'instructor'], 
      default: 'student' 
  },
  profileCreated : { type: Boolean, default: false },
  biography : String,
  avatar: String,
  phone: String,
  courses : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Courses created by the user
  college: String,
  preparingFor: String,
  state: String,
  yearOfAdmission : Number,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Individual courses purchased
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }], // Reference to subscriptions
  purchasedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
  tempAccessCode: { 
      code: String, 
      expiresAt: Date 
  }, // Temporary access code functionality
}, { timestamps: true });

// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

const User = mongoose.model('User', userSchema);
module.exports = User;
