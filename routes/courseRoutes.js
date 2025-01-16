// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const User = require('../models/user');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Create a course (Admin or Instructor only)
router.post('/create-course', authenticate, authorizeRole(['instructor','admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      isFree,
      priceWithDiscount,
      discountPercent,
      image,
      thumbnail,
      type,
      link,
      duration,
      category,
      lessons,
      badges,
      translations,
      subscriptionIncluded,
    
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !duration || !image || !thumbnail) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Create a new course
    const course = new Course({
      title,
      description,
      price: isFree ? 0 : price, // Ensure price is 0 for free courses
      isFree,
      priceWithDiscount,
      discountPercent,
      image,
      thumbnail,
      type,
      link,
      duration,
      category,
      teacher : req.user.id,
      lessons,
      badges,
      translations,
      subscriptionIncluded,
    });
    await User.findByIdAndUpdate(course.teacher, { $push: { courses: course._id } });
    // Save the course to the database
    await course.save();

    res.status(201).json({
      message: 'Course created successfully.',
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.get("/one/:courseId" ,authenticate,  async (req,res)=>{
try{
  const userId = req.user._id;
  const courseId = req.params.courseId;  
  const course = await Course.findById(courseId).populate('lessons').populate('teacher', 'name');
    if (!course ) {
      return res.status(404).json({ message: 'Course not found or not published' });
    }
    let response = {
     id : course._id,
      title: course.title,
      description: course.description,
      price: course.price,  
      teacher: course.teacher ? course.teacher.name : 'Unknown',
      isPurchased: false,
      preview: course.link ?? "Not available",
      thumbnail: course.thumbnail,
      type: course.type,
      duration: course.duration,
      category: course.category ?? "Course",
      status: course.status,
      rating : course.rating,
      studentsCount : course.studentsCount,
      lessonsCount : course.lessonsCount,
      createdAt : course.createdAt,
      discountPercent: course.discountPercent,
      lessons: course.lessons.map((lesson) => ({
        isPurchased : false,
        title: lesson.title,
        preview: lesson.preview || 'This content is locked.',
      })),
      
    };
if (userId){
  const user = await User.findById(userId);

      if ((user && user.purchasedCourses.includes(courseId))|| user.role ==="admin") {
        // Update response to include full lesson content
        response.isPurchased = true;
        response.lessons = course.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          type: lesson.type,
          duration: lesson.duration,
          questions: lesson.questions ?? [],
          isPurchased : true
          
          
         
        }));
      }
}

    res.status(200).json(response); 
}
catch (err){
  console.log(err);
  res.status(500).json({message : "Internal Server Error"});
}
});

router.get('/all', async (req, res) => {
  try {
    const courses = await Course.find().populate({path: 'teacher',select :'name email' }).exec();
    res.status(200).json(courses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a course (Admin or Instructor only)
router.put(
  '/:courseId',
  authenticate,
  authorizeRole(['admin', 'instructor']),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if the course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if the user is authorized to update the course
      const isOwner = course.teacher.toString() === userId;
      const isAdmin = userRole === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'You are not authorized to update this course' });
      }

      // Update the course
      const allowedUpdates = [
        'title',
        'description',
        'price',
        'isFree',
        'priceWithDiscount',
        'discountPercent',
        'image',
        'thumbnail',
        'type',
        'link',
        'duration',
        'category',
        'lessons',
        'badges',
        'translations',
        'subscriptionIncluded',
        'status',
      ];

      const updates = Object.keys(req.body);
      const isValidUpdate = updates.every((key) => allowedUpdates.includes(key));
      if (!isValidUpdate) {
        return res.status(400).json({ message: 'Invalid fields in update request' });
      }

      updates.forEach((key) => {
        course[key] = req.body[key];
      });

      await course.save();

      res.status(200).json({
        message: 'Course updated successfully',
        course,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update course', error: err.message });
    }
  }
);


// Delete a course (Admin or Instructor only)
router.delete('/:courseId', authenticate, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this course' });
    }

    await course.findByIdAndDelete(courseId);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete course', error: err.message });
  }
});
router.post('/purchase', authenticate, async (req, res) => {
  const { courseId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const user = await User.findById(req.user.id);

    // Check if the user already purchased the course
    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Course already purchased.' });
    }

    user.purchasedCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: 'Course purchased successfully.', course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
//my courses
router.get('/my-courses', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('purchasedCourses');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json(user.purchasedCourses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
