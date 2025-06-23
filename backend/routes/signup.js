const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const router = express.Router();

// Multer config for photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/auth/register
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const {
      fullName, fatherName, motherName, mobile,
      email, aadhar, address, state, district, pincode,
      otpVerified, mobileOtpVerified, aadharOtpVerified
    } = req.body;

    const newUser = new User({
      fullName,
      fatherName,
      motherName,
      mobile,
      email,
      aadhar,
      address,
      state,
      district,
      pincode,
      otpVerified: otpVerified === 'true',
      mobileOtpVerified: mobileOtpVerified === 'true',
      aadharOtpVerified: aadharOtpVerified === 'true',
      photo: req.file?.filename || null,
    });

    await newUser.save();
    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

module.exports = router;