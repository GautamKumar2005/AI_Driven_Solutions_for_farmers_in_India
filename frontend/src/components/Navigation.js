import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Navigation.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Logo & Title */}
      <div className="navbar-logo" onClick={() => { navigate("/"); closeMenu(); }}>
        <img src="../ai logo.jpg" alt="Logo" className="logo" />
        <h1 className="Logo_name">AgriConnect</h1>
      </div>

      {/* Hamburger Button */}
      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Menu - links + auth buttons */}
      <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        <ul className="navbar-links">
          <li><a href="/" onClick={closeMenu}>Home</a></li>
          <li><a href="/crop-monitoring" onClick={closeMenu}>Crop Monitoring</a></li>
          <li><a href="/pest-detection" onClick={closeMenu}>Pest Detection</a></li>
          <li><a href="/pricing-info" onClick={closeMenu}>Pricing</a></li>
        </ul>

        <div className="navbar-auth">
          <button 
            className="login-btn" 
            onClick={() => { navigate("/login"); closeMenu(); }}
          >
            Login
          </button>
          <button 
            className="signup-btn" 
            onClick={() => { navigate("/signup"); closeMenu(); }}
          >
            Signup
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;