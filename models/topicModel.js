const mongoose = require('mongoose');
const LessonSchema = require('./leesonModel');
const TopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    totalDuration: { type: String, required: true }, // Total duration of lessons in HH:MM:SS
    totalLesson: { type: Number, required: true }, // Total number of lessons in this topic
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // Array of lessons under this topic
});

module.exports = mongoose.model('Topic', TopicSchema);