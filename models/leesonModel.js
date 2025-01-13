const LessonSchema = new Schema({
    title: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['video', 'quiz', 'test', 'document'], 
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
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  }, { timestamps: true });

  module.exports = mongoose.model('Lesson', LessonSchema);