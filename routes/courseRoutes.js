// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Create a course (Admin or Instructor only)
router.post('/', authenticate, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const {
      title, description, price, isFree, isPaid, priceWithDiscount, discountPercent,
      image, thumbnail, type, link, duration, category, teacher, capacity
    } = req.body;

    const newCourse = new Course({
      title, description, price, isFree, isPaid, priceWithDiscount, discountPercent,
      image, thumbnail, type, link, duration, category, teacher, capacity
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create course', error: err.message });
  }
});

//   try {
//     const courseId = req.params.courseId;
//     const userId = req.user ? req.user._id : null; // Check if user is authenticated

//     // Fetch the course
//     const course = await Course.findById(courseId)
//       .populate('lessons', 'title preview content') // Fetch lesson fields dynamically
//       .populate('instructor', 'name');

//     if (!course || !course.isPublished) {
//       return res.status(404).json({ message: 'Course not found or not published' });
//     }

//     // Default response for non-authenticated users
//     let response = {
//       title: course.title,
//       description: course.description,
//       price: course.price,
//       instructor: course.instructor.name,
//       lessons: course.lessons.map((lesson) => ({
//         title: lesson.title,
//         preview: lesson.preview || 'This content is locked.',
//       })),
//     };

//     // If the user is authenticated, check purchase status
//     if (userId) {
//       const user = await User.findById(userId);

//       if (user && user.purchasedCourses.includes(courseId)) {
//         // Update response to include full lesson content
//         response.lessons = course.lessons.map((lesson) => ({
//           title: lesson.title,
//           content: lesson.content,
//         }));
//       }
//     }

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get('/all', async (req, res) => {
  try {
    const courses = await Course.find().populate({path: 'teacher',select :'name email' }).exec();
    res.status(200).json(courses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Get all courses (Available for Admin, Instructor, or Student with filters)
router.get('/', async (req, res) => {
  try {
    // let query = {};
    // if (req.user.role === 'student') {
    //   query = { status: 'active' };
    // }

    const courses = await Course.find().populate('teacher').exec();
    res.status(200).json(courses);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch courses', error: err.message });
  }
});

// Update a course (Admin or Instructor only)
router.put('/:courseId', authenticate, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, { new: true });
    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update course', error: err.message });
  }
});

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

    await course.remove();
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
