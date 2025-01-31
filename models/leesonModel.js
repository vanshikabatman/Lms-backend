const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { 
      type: String, 
       
      enum: ['video', 'quiz', 'test', 'document'], 
      default: 'video'
    },
    content: { type: String }, 
    questions: [
      {
        question: String, 
        options: [String], 
        correctAnswer: Number,
      },
    ],
    duration: { type: Number }, // For videos or time-limited tests
    preview: { type: String }, // Preview content if applicable
    isDownloadable : {type:Boolean, default:false},
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  }, { timestamps: true });

  module.exports = mongoose.model('Lesson', LessonSchema);