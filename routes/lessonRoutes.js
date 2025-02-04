const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Lesson = require('../models/leesonModel');
const Topic = require('../models/topicModel')

const { authenticate, authorizeRole } = require('../middleware/auth');


router.post('/:topicId/add-lesson', async (req, res) => {
  try {
      const { topicId } = req.params;
      const { lessonId } = req.body;

      // Check if the topic exists
      const topic = await Topic.findById(topicId);
      if (!topic) {
          return res.status(404).json({ message: 'Topic not found' });
      }

      // Check if the lesson exists
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
          return res.status(404).json({ message: 'Lesson not found' });
      }

      // Add lesson to topic
      await Topic.findByIdAndUpdate(topicId, {
          $push: { lessons: lessonId },
          $inc: { totalLesson: 1 }
      });

      res.status(200).json({ message: 'Lesson added to topic successfully!' });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.post('/add', authenticate, authorizeRole(['admin', 'instructor']), async (req, res) => {

const {title , type , content , questions , duration , preview , courseId} = req.body;
if(!title || !type || !courseId){
    return res.status(400).json({message: 'Title, type, and courseId are required'});
}
try{
    const newLesson = new Lesson({
        title , type , content , questions , duration , preview , courseId});
    await newLesson.save();
    await Course.findOneAndUpdate({_id : courseId} , {$inc: {lessonsCount: 1}, $push: {lessons: newLesson._id}});
    
    res.status(201).json(newLesson);
}
catch (err){
    res.status(500).json({message: 'Failed to create lesson', error: err.message});
}

});

router.get('/all', async (req, res) => {
    try {
      const lessons = await Lesson.find();
      res.status(200).json(lessons);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

module.exports = router;