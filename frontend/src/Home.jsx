import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutUs from './components/AboutUS';
import farming1 from "./assets/farming2.jpg";
import Footer from './components/Footer';
import CropMonitoring from './components/CropMonitoring';
import AgriChat from './AgriChat/agrichat'; // Import AgriChat component
import './Home.css'; // Import the CSS file
import { Wind, Leaf, Cloud, Thermometer, BarChart3, Cpu, Users, Tractor, Globe, Building, MonitorSmartphone } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const API_KEY = '6599554e19cc4547bed150414251403';
const GEMINI_API_KEY = 'AIzaSyDvyZIf-3SJ76U-yEDH8ADONPLa1fX1Wz0';

// Input Component
const Input = ({ type, placeholder, value, onChange, className }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      );
      if (!response.ok) throw new Error("City not found");

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="weather-container">
      <div className="content">
        {/* Left Section */}
        <div className="text-content">
          <h1 className="title">Weather App</h1>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
          />
          <button className="search-button" onClick={fetchWeatherData} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>

          {loading && <div className="loader"></div>}
          {error && <p className="error">{error}</p>}

          {!loading && weatherData && (
            <div className="weather-cards">
              <div className="feature-card">
                <Thermometer className="icon" />
                <h3>Temperature</h3>
                <p>{weatherData.current.temp_c}°C</p>
                <span>{weatherData.current.condition.text}</span>
              </div>

              <div className="feature-card">
                <Wind className="icon" />
                <h3>Wind Speed</h3>
                <p>{weatherData.current.wind_kph} kph</p>
                <span>Feels like {weatherData.current.feelslike_c}°C</span>
              </div>

              <div className="feature-card">
                <Cloud className="icon" />
                <h3>Humidity</h3>
                <p>{weatherData.current.humidity}%</p>
                <span>Pressure: {weatherData.current.pressure_mb} mb</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Section (Anchor Image) */}
        <div className="image-container">
          <img src="/anchor.jpg" alt="Weather Forecast" className="background-img" />
        </div>
      </div>
    </section>
  );
};

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo & Title */}
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src="/ai logo.jpg" alt="Logo" className="logo" />
        <h1>AgriConnect</h1>
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

// Button Component
const Button = ({ children, onClick, className }) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

// Card Components
const Card = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

const CardContent = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

const CardHeader = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

const CardTitle = ({ children, className }) => {
  return <h3 className={className}>{children}</h3>;
};

const CardDescription = ({ children, className }) => {
  return <p className={className}>{children}</p>;
};

// FeatureCard Component
const FeatureCard = ({ title, path, background }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(path);
  };

  return (
    <div
      className="feature-card"
      style={{ backgroundImage: `url(${background})` }}
      onClick={handleNavigation}
    >
      <div className="feature-overlay">
        <h3 className="feature-title">{title}</h3>
        <button className="feature-button">Explore</button>
      </div>
    </div>
  );
};

// Footer Component
// const Footer = () => {
//   return (
//     <footer className="footer">
//       <div className="footer-container">
//         <div className="footer-grid">
//           <div className="footer-item">
//             <h3 className="footer-title">
//               <span className="footer-icon">🌿</span> AgriConnect
//             </h3>
//             <p className="footer-description">
//               Revolutionizing agriculture with artificial intelligence and data-driven insights.
//             </p>
//             <div className="footer-social">
//               <a href="https://www.facebook.com" className="social-linkss" aria-label="Facebook">
//                <FaFacebookF />
//               </a>
//               <a href="https://www.twitter.com" className="social-linkss" aria-label="Twitter">
//                 <FaTwitter />
//               </a>
//               <a href="https://www.instagram.com" className="social-linkss" aria-label="Instagram">
//                 <FaInstagram />
//               </a>
//               <a href="https://www.youtube.com" className="social-linkss" aria-label="YouTube">
//                 <FaYoutube />
//               </a>
//               <a href="https://www.linkedin.com" className="social-linkss" aria-label="LinkedIn">
//                 <FaLinkedin />
//               </a>
//             </div>
//           </div>
//           <div className="footer-item">
//             <h3 className="footer-heading">Government Links</h3>
//             <ul className="footer-links">
//               <li><a href="https://www.india.gov.in/topics/agriculture" className="footer-link">Indian Government - Agriculture</a></li>
//               <li><a href="https://nfsm.gov.in/" className="footer-link">National Food Security Mission</a></li>
//             </ul>
//           </div>
//         </div>
//       </div>
//       <div className="footer-bottom">
//         <p>&copy; 2025 AgriConnect. All rights reserved.</p>
//       </div>
//     </footer>
//   );
// };


const features = [
  { title: "Marketing Analysis", path: "/marketing" },
  { title: "Government MSP Rates", path: "/msp-rates" },
  { title: "Global Crop Trends", path: "/crop-trends" },
  { title: "Agricultural Technology", path: "/agri-tech" },
  { title: "Community Network", path: "/community" }
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="features-section"
      style={{ backgroundImage: `url(${farming1})` }}
    >
      <div className="features-overlay">
        <h2 className="features-title">Agricultural Intelligence</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              onClick={() => navigate(feature.path)}
            >
              <h3 className="feature-title">{feature.title}</h3>
              <button className="feature-button">Explore</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main App Component
function Home() {
  const [city, setCity] = useState('Delhi');
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const navigate = useNavigate();
  
  return (
    <div className="app-container">
      {/* Weather App Section */}
      <WeatherApp/>
      {/* About Us Section */}
      <AboutUs/>
      {/* Features Section */}
      <FeaturesSection/>
      {/* Footer */}
      <Footer />
      {/* AgriChat Section */}
    </div>
  );
}

export default Home;