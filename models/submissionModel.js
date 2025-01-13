const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  answers: [Number], // User's answers (as indices of selected options)
  score: { type: Number }, // Calculated score
  submittedAt: { type: Date, default: Date.now }, // Timestamp for submission
});

module.exports = mongoose.model('Submission', SubmissionSchema);