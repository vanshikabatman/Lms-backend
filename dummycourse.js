const mongoose = require('mongoose');
const Course = require('./models/course');
const Topic = require('./models/topicModel');
const Lesson = require('./models/leesonModel');


mongoose.connect("mongodb+srv://amarkounsalmac:XZLg3hVqwmw16jvn@cluster0.3j4aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected')).catch(err => console.log(err));



  
  
  const seedCourses = async () => {
    try {
      await Course.deleteMany({});
      await Topic.deleteMany({});
      await Lesson.deleteMany({});
  
      const instructorId = '6786171b1e04c8371496aa14';
  
      const topics = await Topic.insertMany([
        {
          title: 'Biology Fundamentals',
          totalDuration: '02:30:00',
          totalLesson: 3,
        },
        {
          title: 'Organic Chemistry',
          totalDuration: '03:00:00',
          totalLesson: 4,
        },
        {
          title: 'Physics for NEET',
          totalDuration: '04:00:00',
          totalLesson: 5,
        },
        {
          title: 'Human Anatomy',
          totalDuration: '03:30:00',
          totalLesson: 4,
        },
      ]);
  
      const lessons = await Lesson.insertMany([
        {
          title: 'Cell Structure & Function',
          type: 'video',
          content: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 45,
          topicId: topics[0]._id,
        },
        {
          title: 'DNA & RNA Basics',
          type: 'document',
          content: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 30,
          topicId: topics[0]._id,
        },
        {
          title: 'Hydrocarbons & Alkanes',
          type: 'video',
          content: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 50,
          topicId: topics[1]._id,
        },
      ]);
  
      const courses = await Course.insertMany([
        {
          title: 'NEET Prep 2026 - Complete Biology',
          description: 'Comprehensive NEET Biology course covering all major topics.',
          price: 4999,
          isFree: false,
          priceWithDiscount: 3999,
          discountPercent: 20,
          image: 'https://picsum.photos/300/200',
          thumbnail: 'https://picsum.photos/300/200',
          type: 'video',
          link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 1200,
          category: 'Medical Entrance',
          teacher: instructorId,
          studentsCount: 1200,
          reviewsCount: 200,
          rating: 4.8,
          topics: [topics[0]._id],
          badges: ['Best Seller', 'Top Rated'],
          subscriptionIncluded: true,
        },
        {
          title: 'NEET Chemistry - Organic Chemistry Mastery',
          description: 'Master organic chemistry with detailed video lessons and quizzes.',
          price: 2999,
          isFree: false,
          priceWithDiscount: 2499,
          discountPercent: 15,
          image: 'https://picsum.photos/300/200',
          thumbnail: 'https://picsum.photos/300/200',
          type: 'video',
          link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 900,
          category: 'Medical Entrance',
          teacher: instructorId,
          studentsCount: 850,
          reviewsCount: 150,
          rating: 4.7,
          topics: [topics[1]._id],
          badges: ['Expert Recommended'],
          subscriptionIncluded: false,
        },
        {
          title: 'Physics for NEET - Mechanics & Thermodynamics',
          description: 'Detailed physics course covering mechanics and thermodynamics for NEET.',
          price: 3499,
          isFree: false,
          priceWithDiscount: 2999,
          discountPercent: 15,
          image: 'https://picsum.photos/300/200',
          thumbnail: 'https://picsum.photos/300/200',
          type: 'video',
          link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 1100,
          category: 'Medical Entrance',
          teacher: instructorId,
          studentsCount: 950,
          reviewsCount: 180,
          rating: 4.6,
          topics: [topics[2]._id],
          badges: ['Comprehensive Coverage'],
          subscriptionIncluded: true,
        },
        {
          title: 'Human Anatomy for Medical Students',
          description: 'An in-depth course on human anatomy for aspiring medical students.',
          price: 3999,
          isFree: false,
          priceWithDiscount: 3499,
          discountPercent: 12,
          image: 'https://picsum.photos/300/200',
          thumbnail: 'https://picsum.photos/300/200',
          type: 'document',
          link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 950,
          category: 'Medical Entrance',
          teacher: instructorId,
          studentsCount: 700,
          reviewsCount: 120,
          rating: 4.7,
          topics: [topics[3]._id],
          badges: ['Best for Beginners'],
          subscriptionIncluded: false,
        },
      ]);
  
      console.log('Courses Seeded Successfully!');
      mongoose.connection.close();
    } catch (err) {
      console.error('Seeding Error:', err);
      mongoose.connection.close();
    }
  };
  
  seedCourses();
  
