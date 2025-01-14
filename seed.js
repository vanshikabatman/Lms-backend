const mongoose = require('mongoose');
const Course = require('./models/course');
const Lesson = require('./models/leesonModel');
const User = require('./models/user');

async function seedDatabase() {
  await mongoose.connect('mongodb+srv://amarkounsalmac:XZLg3hVqwmw16jvn@cluster0.3j4aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear existing data
  await Course.deleteMany({});
  await Lesson.deleteMany({});
  await User.deleteMany({});
  const user1 = new User({
    name: 'User 1',
    email: 'user1@example.com',
    password: 'password1',
    purchasedCourses: [],
    role: 'student',
    college: 'College 1',
    class: 'Class 1',
    state: 'State 1',
  });
  const user2 = new User({
    name: 'User 2',
    email: 'user2@example.com',
    password: 'password2',
    purchasedCourses: [],
    role: 'instructor',
    college: 'College 2',
    class: 'Class 2',
    state: 'State 2',
  });

  await user1.save();
  await user2.save();
  // Create sample courses
  const course1 = new Course({
    title: 'Course 1',
    description: 'Description for Course 1',
    price: 100,
    teacher: user2._id,
    duration: 10,
    type: 'online',
    thumbnail: 'thumbnail1.jpg',
    image: 'image1.jpg'
  });
  const course2 = new Course({
    title: 'Course 2',
    description: 'Description for Course 2',
    price: 200,
    teacher: user2._id,
    duration: 20,
    type: 'offline',
    thumbnail: 'thumbnail2.jpg',
    image: 'image2.jpg'
  });

  await course1.save();
  await course2.save();

  // Create sample lessons
  const lesson1 = new Lesson({
    title: 'Lesson 1',
    type: 'video',
    content: 'Content for Lesson 1',
    questions: [{ question: 'Question 1' }, { question: 'Question 2' }],
    duration: 30,
    preview: true,
    courseId: course1._id,
  });
  const lesson2 = new Lesson({
    title: 'Lesson 2',
    type: 'video',
    content: 'Content for Lesson 2',
    questions: [],
    duration: 45,
    preview: false,
    courseId: course1._id,
  });
  const lesson3 = new Lesson({
    title: 'Lesson 3',
    type: 'video',
    content: 'Content for Lesson 3',
    questions: [],
    duration: 60,
    preview: true,
    courseId: course2._id,
  });

  await lesson1.save();
  await lesson2.save();
  await lesson3.save();

  // Update lessonsCount for each course
  await Course.findOneAndUpdate({ _id: course1._id }, { $inc: { lessonsCount: 2 } });
  await Course.findOneAndUpdate({ _id: course2._id }, { $inc: { lessonsCount: 1 } });
  await User.findOneAndUpdate({ _id: user1._id }, { $push: { purchasedCourses: [course1._id , course2._id] } });
  await User.findOneAndUpdate({ _id: user2._id }, { $push: { purchasedCourses: [course1._id , course2._id] } });

  // Create sample users



  console.log('Database seeded successfully');
  mongoose.connection.close();
}

seedDatabase().catch(err => {
  console.error('Error seeding database:', err);
  mongoose.connection.close();
});