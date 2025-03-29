import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../styles/Navigation.css';

const Navbar = () => {
    const navigate = useNavigate();
  
    return (
      <nav className="navbar">
        {/* Logo & Title */}
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <img src="../ai logo.jpg" alt="Logo" className="logo" />
          <h1 className='Logo_name'>AgriConnect</h1>
        </div>
  
        {/* Navigation Links */}
        <ul className="navbar-links">
          <li><a href="/">Home</a></li>
          <li><a href="/crop-monitoring">Crop Monitoring</a></li>
          <li><a href="/pest-detection">Pest Detection</a></li>
          <li><a href="/pricing-info">Pricing</a></li>
        </ul>
  
        {/* Login & Signup Buttons */}
        <div className="navbar-auth">
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="signup-btn" onClick={() => navigate("/signup")}>Signup</button>
        </div>
      </nav>
    );
  };

export default Navbar;