// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user'); 

// ─── Multer configuration for photo upload ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'));
  }
});

// ─── REGISTER ────────────────────────────────────────────────
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      email,
      password,
      address,
      state,
      district,
      pincode
    } = req.body;

    // Basic validation
    if (!fullName || !mobile || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name, mobile, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or mobile already exists' 
      });
    }

    // Create user
    const user = new User({
      fullName,
      mobile,
      email,
      password,           // will be hashed automatically by pre-save hook
      address: address || undefined,
      state: state || undefined,
      district: district || undefined,
      pincode: pincode || undefined,
    });

    // Add photo path if uploaded
    if (req.file) {
      user.photo = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here_change_this',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!password || (!email && !mobile)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email/mobile and password are required' 
      });
    }

    // Find user by email or mobile
    const user = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here_change_this',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

module.exports = router;