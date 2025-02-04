const mongoose = require('mongoose');
const ExamSchema = new mongoose.Schema({
    price: { type: Number, required: function() { return !this.isFree; } }, // Required only if not free
    isFree: { type: Boolean, default: false }, 
    title: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    isPurchased : { type: Boolean, default: false }, 
    teacher : { type: mongoose.Schema.Types.ObjectId,  ref: 'User', required: true }  
    
  });
  const ExamResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    score: Number,
    timestamp: { type: Date, default: Date.now },
  });
  const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
  });
  const Question = mongoose.model("Question", QuestionSchema);
  const Exam = mongoose.model("Exam", ExamSchema);
  const ExamResult = mongoose.model("ExamResult",ExamResultSchema);

  module.exports = {Question, Exam , ExamResult}