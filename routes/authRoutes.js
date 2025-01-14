// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: username,
      email: email,
      password: hashedPassword,
      role: role
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate({ path: "subscriptions", populate: { path: "plan" } });
    if (!user) {
      console.log("balle balle");
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


module.exports = router;
