// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Topic = require('../models/topicModel');
const Lesson = require('../models/leesonModel');
const User = require('../models/user');
const { authenticate, authorizeRole } = require('../middleware/auth');
const FeauredCourseModel = require('../models/featuredCourse');

// Create a course (Admin or Instructor only)
router.post('/create-course', authenticate, authorizeRole(['instructor', 'admin']), async (req, res) => {
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
      topics, // Now storing topics separately
      badges,
      translations,
      subscriptionIncluded,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !duration || !image || !thumbnail) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Ensure price is handled correctly
    const finalPrice = isFree ? 0 : price;

    let topicIds = [];
    let totalLessonsCount = 0;

    // Create Topics & Lessons
    for (const topicData of topics) {
      if (!topicData.title || !Array.isArray(topicData.lessons) || topicData.lessons.length === 0) {
        return res.status(400).json({ error: `Topic "${topicData.title}" must contain lessons.` });
      }

      // Create Topic
      const newTopic = new Topic({
        title: topicData.title,
        totalDuration: topicData.totalDuration || "0",
        totalLesson: topicData.lessons.length,
        lessons: [],
      });

      await newTopic.save();

      let lessonIds = [];
      for (const lessonData of topicData.lessons) {
        const newLesson = new Lesson({
          title: lessonData.title,
          content: lessonData.content,
          duration: lessonData.duration,
          isComplete: lessonData.isComplete || false,
          topicId: newTopic._id, // Reference to Topic
        });

        await newLesson.save();
        lessonIds.push(newLesson._id);
      }

      // Update Topic with lesson IDs
      newTopic.lessons = lessonIds;
      await newTopic.save();

      topicIds.push(newTopic._id);
      totalLessonsCount += topicData.lessons.length;
    }

    // Create Course
    const course = new Course({
      title,
      description,
      price: finalPrice,
      isFree,
      priceWithDiscount,
      discountPercent,
      image,
      thumbnail,
      type,
      link,
      duration,
      category,
      teacher: req.user.id,
      topics: topicIds, // Store topic ObjectIds
      lessonsCount: totalLessonsCount,
      badges,
      translations,
      subscriptionIncluded,
    });

    // Save course to database
    await course.save();

    // Add course reference to the instructor
    await User.findByIdAndUpdate(req.user.id, { $push: { courses: course._id } });

    res.status(201).json({
      message: 'Course created successfully.',
      course,
      lessonData: {
        topics: topics.map((topic, index) => ({
          title: topic.title,
          totalDuration: topic.totalDuration,
          lessons: topic.lessons.map((lesson, index) => ({
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            isComplete: lesson.isComplete,
          })),
        })),
      }
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: 'Something went wrong.', details: error.message });
  }
});


router.get("/one/:courseId", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId;

    // Populate topics and their lessons along with the teacher
    const course = await Course.findById(courseId)
      .populate({
        path: "topics",
        populate: {
          path: "lessons",
          select: "title preview content type duration questions", // Only necessary fields
        },
      })
      .populate("teacher", "name")
      .exec();

    if (!course) {
      return res.status(404).json({ message: "Course not found or not published" });
    }

    let response = {
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      teacher: course.teacher ? course.teacher.name : "Unknown",
      isPurchased: false,
      preview: course.link ?? "Not available",
      thumbnail: course.thumbnail,
      type: course.type,
      duration: course.duration,
      category: course.category ?? "Course",
      status: course.status,
      rating: course.rating,
      studentsCount: course.studentsCount,
      lessonsCount: course.lessonsCount,
      createdAt: course.createdAt,
      discountPercent: course.discountPercent,

      // Structure topics with lessons
      topics: course.topics.map((topic) => ({
        id: topic._id,
        title: topic.title,
        totalDuration: topic.totalDuration,
        lessons: topic.lessons.map((lesson) => ({
          isPurchased: false,
          title: lesson.title,
          type : lesson.type,
          preview: lesson.preview || "This content is locked.",
        })),
      })),
    };

    // Check if the user has purchased the course or is an admin
    if (userId) {
      const user = await User.findById(userId);

      if ((user && user.purchasedCourses.includes(courseId)) || user.role === "admin") {
        response.isPurchased = true;
        response.topics = course.topics.map((topic) => ({
          id: topic._id,
          title: topic.title,
          totalDuration: topic.totalDuration,
          lessons: topic.lessons.map((lesson) => ({
            id: lesson._id,
            title: lesson.title,
            content: lesson.content ?? "",
            type: lesson.type,
            duration: lesson.duration,
            questions: lesson.questions ?? [],
            isPurchased: true,
          })),
        }));
      }
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get('/all', async (req, res) => {
  try {
    const courses = await Course.find().populate({path: 'teacher',select :'name email'}).populate({ path: 'topics', select: 'title totalDuration' }).exec();
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

    await Course.findByIdAndDelete(courseId);
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

    res.status(200).json({courses : user.purchasedCourses.map((pcourse)=>{
      return {
        id : pcourse._id,
        title : pcourse.title,
        description : pcourse.description,
        thumbnail : pcourse.thumbnail,
        teacher : pcourse.teacher.name,
        type : pcourse.type,
        duration : pcourse.duration,
        category : pcourse.category,
        lessonsCount : pcourse.lessonsCount,
        preview : pcourse.link,
        rate : pcourse.rating,
        price : pcourse.price,
      }
    })});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get('/top-new-courses', async (req, res) => {
  try {
    const topNewCourses = await Course.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(topNewCourses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch top new courses', error: err.message });
  }
});
router.get('/get-featured-courses', async (req, res) => {
try{
  const FeaturedCourse = await FeauredCourseModel.find().populate({path: 'courseId' , populate : {path : 'teacher', select : 'name'}}).exec();
  res.status(200).json({
    Featured : FeaturedCourse.map((course)=>course.courseId),
  });
}
catch (err) {
  res.status(500).json({ message: 'Failed to fetch featured courses', error: err.message });
}

});
router.post('/add-featured-course', authenticate, authorizeRole(['admin']), async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const featuredCourse = new FeauredCourseModel({ courseId });
    await featuredCourse.save();

    res.status(200).json({ message: 'Course added as featured successfully', featuredCourse });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add featured course', error: err.message });
  }
});
router.delete('/remove-featured-course', authenticate, authorizeRole(['admin']), async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  try {
    const featuredCourse = await FeauredCourseModel.findOneAndDelete({ courseId });
    if (!featuredCourse) {
      return res.status(404).json({ message: 'Featured course not found' });
    }

    res.status(200).json({ message: 'Course removed from featured successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add featured course', error: err.message });
  }
});






module.exports = router;
