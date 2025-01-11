const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Models
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
    // UgPgCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'UgPgCourse' },
    college: String,
    class: String,
    state: String,
    tempAccessCode: {
      code: String,
      expiresAt: Date,
    },
});
  const User = mongoose.model('User', userSchema);
  
  const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    videoUrl: String,
    isPurchased: { type: Boolean, default: false },
  });
  const Course = mongoose.model('Course', CourseSchema);
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();

    // Add sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: hashedPassword },
      { name: 'Jane Smith', email: 'admin@demo.com', password: hashedPassword , role: "admin" },
    ];
    await User.insertMany(users);

    // Add sample courses
    const courses = [
      { title: 'Introduction to Programming', description: 'Learn the basics of programming.', price: 100, videoUrl: 'https://example.com/course1.mp4' },
      { title: 'Advanced JavaScript', description: 'Master advanced JavaScript concepts.', price: 200, videoUrl: 'https://example.com/course2.mp4' },
      { title: 'React for Beginners', description: 'Start building web apps with React.', price: 150, videoUrl: 'https://example.com/course3.mp4' },
    ];
    await Course.insertMany(courses);

    console.log('Sample data added successfully.');
    process.exit();
  } catch (err) {
    console.error('Error seeding the database:', err);
    process.exit(1);
  }
};

seedDatabase();
