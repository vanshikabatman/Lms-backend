// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const course = require('./course');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
    // UgPgCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'UgPgCourse' },
    college: String,
    class: String,
    state: String,
    tempAccessCode: {
      code: String,
      expiresAt: Date,
    },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
