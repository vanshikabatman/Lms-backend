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

const submission = require('./models/submissionModel');
const razor = require('./routes/razorPay');
const lessonRoute = require('./routes/lessonRoutes');
const collegeRoute = require('./routes/collegeRoute');
const stateRoute = require('./routes/stateRoute');
const categoryRoute = require('./routes/categoryRoute');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
