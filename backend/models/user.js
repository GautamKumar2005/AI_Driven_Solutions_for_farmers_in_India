const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  fatherName: String,
  motherName: String,
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  aadhar: String,
  address: String,
  state: String,
  district: String,
  pincode: String,
  photo: {
    type: String, // will store the filename or URL of the uploaded photo
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  mobileOtpVerified: {
    type: Boolean,
    default: false,
  },
  aadharOtpVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', UserSchema);