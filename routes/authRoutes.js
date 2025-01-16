// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticate, authorizeRole } = require('../middleware/auth');
const path = require('path');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: username,
      email: email,
      password: hashedPassword,
      role: 'student'
    });


    await user.save();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.status(201).json({ message: 'User created successfully' , token,user});
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});


router.post('/register-instructor', authenticate, authorizeRole(['admin']), async (req, res) => {
  const { name, email, password, biography, avatar, phone, state } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: 'instructor',
      biography: biography,
      avatar: avatar,
      phone: phone,
      state: state,
      profileCreated: true
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  }
  catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
}
);

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate([{ path: "subscriptions", populate: { path: "plan" } }, { path: "purchasedCourses" }]);
    if (!user) {

      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log(user.password);
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      token, user:
        user
    });
  } catch (err) {
    res.status(400).json({ message: 'Error logging in', error: err.message });
  }
});
router.post('/admin/generate-code', async (req, res) => {
  const { email } = req.body;
  try {

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const tempCode = crypto.randomBytes(4).toString('hex'); // Generate a 4-byte hex code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    user.tempAccessCode = { code: tempCode, expiresAt };
    await user.save();

    res.status(200).json({ message: 'Temporary access code generated.', code: tempCode });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login-with-code', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email }).populate('purchasedCourses');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.tempAccessCode || user.tempAccessCode.code !== code || new Date() > user.tempAccessCode.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired access code.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'defaultSecretKey', { expiresIn: '1h' });

    // Clear the temp access code after use
    user.tempAccessCode = null;
    await user.save();

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        purchasedCourses: user.purchasedCourses
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/admin/get-all-users', async (req, res) => {
  try {
    const users = await User.find();
    if (!users.length) {
      return res.status(404).json({ message: 'No users found.' });
    }

    res.status(200).json({
      message: 'Users fetched successfully.',
      users, // Return the list of users
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while fetching users.', error: err.message });
  }
});

router.delete('/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User deleted successfully.',
      user: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while deleting the user.', error: err.message });
  }
});

router.get('/get-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User details fetched successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tempAccessCode: user.tempAccessCode,
        purchasedCourses: user.purchasedCourses,
        subscriptions: user.subscriptions,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while fetching user details.', error: err.message });
  }
});

// router.put('/update-user/:id', authenticate , async (req, res) => {
//   const { id } = req.params;
//   const { name, email , phone,college , preparingFor , state } = req.body;

//   try {
//     if( id !== req.user.id || req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'You are not authorized to update this user.' });
//     }

//     const user = await User.findById(id);}

//     catch (err) {}
//   });

router.post('/create-profile', authenticate, async (req, res) => {
  const { college, preparingFor, state, avatar, phone } = req.body;

  try {
    // Validate request body
    if (!college || !preparingFor || !state || !avatar || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Update user profile directly
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { college : college, preparingFor : preparingFor, state : state, avatar : avatar, phone:phone , profileCreated : true},  // Fields to update
      { new: true, runValidators: true } // Options: return updated user & validate fields
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
