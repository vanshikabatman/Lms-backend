const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

dotenv.config();

// Initialize the app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Middleware for authentication

// // Add a course
// app.post('/api/courses', authenticate, async (req, res) => {
//   const { title, description, price, videoUrl } = req.body;
//   try {
//     const course = new Course({ title, description, price, videoUrl });
//     await course.save();
//     res.status(201).json({ message: 'Course added successfully.' });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Get all courses
// app.get('/api/courses', async (req, res) => {
//   try {
//     const courses = await Course.find();
//     res.status(200).json(courses);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Purchase course
// app.post('/api/purchase', authenticate, async (req, res) => {
//   const { courseId } = req.body;
//   try {
//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ message: 'Course not found.' });

//     const user = await User.findById(req.user.id);

//     // Check if the user already purchased the course
//     if (user.purchasedCourses.includes(courseId)) {
//       return res.status(400).json({ message: 'Course already purchased.' });
//     }

//     user.purchasedCourses.push(courseId);
//     await user.save();

//     res.status(200).json({ message: 'Course purchased successfully.', course });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Get purchased courses
// app.get('/api/my-courses', authenticate, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('purchasedCourses');
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     res.status(200).json(user.purchasedCourses);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
