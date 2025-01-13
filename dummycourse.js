const mongoose = require('mongoose');
const Course = require('./models/course');

mongoose.connect("mongodb+srv://amarkounsalmac:XZLg3hVqwmw16jvn@cluster0.3j4aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Dummy data for courses
const dummyCourses = [
  {
    title: 'JavaScript for Beginners',
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
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId from your User collection
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
  {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  },
  {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
  }, {
    title: 'Mastering Python',
    description: 'Advance your Python skills with this in-depth course.',
    isFree: true,
    image: 'https://example.com/python-course-cover.jpg',
    thumbnail: 'https://example.com/python-course-thumbnail.jpg',
    type: 'document',
    link: 'https://example.com/python-course',
    duration: 200,
    category: 'Programming',
    teacher: '63e57f9d1b4e88a9d1c2f3a5', // Replace with a valid ObjectId
    studentsCount: 300,
    reviewsCount: 50,
    rating: 4.8,
    status: 'active',
    badges: ['Advanced', 'Top Rated'],
    translations: [
      { language: 'fr', title: 'Maîtriser Python', description: 'Approfondissez vos compétences en Python.' },
    ],
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
