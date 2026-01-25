// src/pages/Signup.jsx   (or wherever you place it)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css'; // your styling file

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    address: '',
    state: '',
    district: '',
    pincode: '',
    password: '',
    confirmPassword: '',
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          return;
        }
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
          setError('Only JPG, JPEG or PNG files are allowed');
          return;
        }

        setFormData((prev) => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
        setFileName(file.name);
        setError('');
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear password-related error when typing
      if (name === 'password' || name === 'confirmPassword') {
        setError('');
      }
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      setError('Mobile number must be exactly 10 digits');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be exactly 6 digits');
      return false;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = new FormData();

      // Append all fields except confirmPassword
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirmPassword' && value !== null) {
          data.append(key, value);
        }
      });

      const response = await axios.post('../../backend/routes/auth.js', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.status === 200) {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Something went wrong. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join our farming community today</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              type="tel"
              name="mobile"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="yourname@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              placeholder="House no, Street, Area"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                name="state"
                placeholder="e.g. Delhi"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group half">
              <label htmlFor="district">District</label>
              <input
                id="district"
                type="text"
                name="district"
                placeholder="e.g. New Delhi"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              type="text"
              name="pincode"
              placeholder="6-digit pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          {/* Photo upload section */}
          <div className="photo-section">
            <label className="photo-label">
              Profile Photo <span className="optional">(optional)</span>
            </label>

            <div className="photo-preview-container">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">No photo selected</div>
              )}
            </div>

            <label className="file-input-label">
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="file-input"
              />
              <span className="file-button">Choose Photo</span>
              <span className="file-name-display">{fileName}</span>
            </label>
          </div>

          <button
            type="submit"
            className={`signup-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="login-redirect">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;