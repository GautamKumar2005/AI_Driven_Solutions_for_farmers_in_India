import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    mobile: "",
    email: "",
    aadhar: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    photo: null,
    otpVerified: false,
    mobileOtpVerified: false,
    aadharOtpVerified: false,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
        setFileName(file.name);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.otpVerified || !formData.mobileOtpVerified || !formData.aadharOtpVerified) {
      alert("Please verify all OTPs before submitting.");
      return;
    }

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataObj.append(key, value);
        }
      });

      const response = await axios.post("/api/auth/register", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        navigate("/login");
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Register</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required className="signup-input" />
          <input type="text" name="fatherName" placeholder="Father's Name" onChange={handleChange} required className="signup-input" />
          <input type="text" name="motherName" placeholder="Mother's Name" onChange={handleChange} required className="signup-input" />
          <input type="text" name="mobile" placeholder="Mobile Number" onChange={handleChange} required className="signup-input" />
          <button type="button" onClick={() => setFormData({ ...formData, mobileOtpVerified: true })} className="signup-button">Verify Mobile OTP</button>
          <input type="email" name="email" placeholder="Email ID" onChange={handleChange} required className="signup-input" />
          <button type="button" onClick={() => setFormData({ ...formData, otpVerified: true })} className="signup-button">Verify Email OTP</button>
          <input type="text" name="aadhar" placeholder="Aadhar Number" onChange={handleChange} required className="signup-input" />
          <button type="button" onClick={() => setFormData({ ...formData, aadharOtpVerified: true })} className="signup-button">Verify Aadhar OTP</button>
          <input type="text" name="address" placeholder="Address" onChange={handleChange} required className="signup-input" />
          <input type="text" name="state" placeholder="State" onChange={handleChange} required className="signup-input" />
          <input type="text" name="district" placeholder="District" onChange={handleChange} required className="signup-input" />
          <input type="text" name="pincode" placeholder="Pin Code" onChange={handleChange} required className="signup-input" />

          {/* Profile Photo Upload Section */}
          <div className="photo-upload-container">
            <label className="photo-upload-label">Upload Profile Photo</label>
            
            <div className="photo-preview">
              {photoPreview ? <img src={photoPreview} alt="Profile Preview" /> : <span className="placeholder">No Image</span>}
            </div>

            <label className="custom-file-upload">
              <input type="file" name="photo" accept="image/*" onChange={handleChange} required />
              <span>Choose File</span>
            </label>
            <p className="file-name">{fileName}</p>
          </div>

          <button type="submit" className="signup-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
