const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Lesson = require('../models/leesonModel');

const { authenticate, authorizeRole } = require('../middleware/auth');

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