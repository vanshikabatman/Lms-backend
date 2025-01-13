const mongoose = require('mongoose');
const Course = require('./models/course');

mongoose.connect("mongodb+srv://amarkounsalmac:XZLg3hVqwmw16jvn@cluster0.3j4aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Dummy data for courses
const dummyCourses = [
  {
    title: 'JavaScript for Beginners EWWWW',
    description: 'Learn JavaScript from scratch with this comprehensive course.',
    price: 19.99,
    isFree: false,
    priceWithDiscount: 9.99,
    discountPercent: 50,
    image: 'https://example.com/js-course-cover.jpg',
    thumbnail: 'https://example.com/js-course-thumbnail.jpg',
    type: 'video',
    link: 'https://example.com/js-course',
    duration: 120,
    category: 'Programming',
    teacher: '67838c7bad74e1690cdb588e', // Replace with a valid ObjectId from your User collection
    studentsCount: 100,
    reviewsCount: 20,
    rating: 4.5,
    status: 'active',
    startDate: new Date('2025-01-15'),
    expireOn: new Date('2025-12-31'),
    capacity: 500,
    badges: ['Beginner Friendly', 'Best Seller'],
    translations: [
      { language: 'es', title: 'JavaScript para Principiantes', description: 'Aprende JavaScript desde cero.' },
    ],
    subscriptionIncluded: true,
  },

];

// Function to insert dummy courses into the database
const insertDummyCourses = async () => {
  try {
    await Course.insertMany(dummyCourses);
    console.log('Dummy courses added successfully');
  } catch (error) {
    console.error('Error adding dummy courses:', error);
  } finally {
    mongoose.connection.close(); // Close the connection after operation
  }
};

// Run the function
insertDummyCourses();
