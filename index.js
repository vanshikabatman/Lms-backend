const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const lesson = require('./models/leesonModel');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const planRoutes = require('./routes/planRoutes');
const Transaction = require('./models/transactionModel');
const Subscription = require('./models/subscriptionModel');
const {emailrouter} = require('./routes/mailer');
const submission = require('./models/submissionModel');
const razor = require('./routes/razorPay');
const lessonRoute = require('./routes/lessonRoutes');
const collegeRoute = require('./routes/collegeRoute');
const stateRoute = require('./routes/stateRoute');
const categoryRoute = require('./routes/categoryRoute');
const examRoute = require('./routes/examRoutes');
const profileRoute = require('./routes/profileRoute');

dotenv.config();

// Initialize the app
const app = express();

app.use(cors({
  origin: ["https://lms.bharatchains.com", "https://lmsapp.bharatchains.com" , "*"],   // Allow only this domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));
app.get('/', (req,res)=>{
  res.status(200).json({mess : "HELLOOO"});
})
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/plan',planRoutes );
app.use('/api/razorpay', razor);
app.use('/api/lessons', lessonRoute);
app.use('/api/college', collegeRoute);
app.use('/api/state', stateRoute);
app.use('/api/category', categoryRoute);
app.use('/api/exam/',examRoute );
app.use('/api/email', emailrouter);
app.use('/api/profile' , profileRoute );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
