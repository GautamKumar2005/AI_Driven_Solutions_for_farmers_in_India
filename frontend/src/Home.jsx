import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ← Must import Link
import AboutUs from './components/AboutUS';
import farming1 from "./assets/farming2.jpg";
import Footer from './components/Footer';
import './Home.css';
import { Wind, Cloud, Thermometer } from "lucide-react";

const API_KEY = '6599554e19cc4547bed150414251403';

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
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherData = async () => {
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      );
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="weather-container">
      <div className="weather-content">
        <h1 className="title">Weather Forecast</h1>
        <div className="search-box">
          <Input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
          />
          <button
            className="search-button"
            onClick={fetchWeatherData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {loading && <div className="loader"></div>}
        {weatherData && (
          <div className="weather-cards">
            <div className="weather-feature-card temperature-card">
              <Thermometer className="icon" />
              <h3>Temperature</h3>
              <p>{weatherData.current.temp_c}°C</p>
              <span>{weatherData.current.condition.text}</span>
            </div>
            <div className="weather-feature-card wind-card">
              <Wind className="icon" />
              <h3>Wind Speed</h3>
              <p>{weatherData.current.wind_kph} kph</p>
              <span>Feels like {weatherData.current.feelslike_c}°C</span>
            </div>
            <div className="weather-feature-card humidity-card">
              <Cloud className="icon" />
              <h3>Humidity</h3>
              <p>{weatherData.current.humidity}%</p>
              <span>Pressure: {weatherData.current.pressure_mb} mb</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// FeatureCard – Now with proper active state & Link
const FeatureCard = ({ title, path }) => {
  return (
    <Link to={path} className="feature-card">
      <div className="feature-overlay">
        <h3 className="feature-title">{title}</h3>
        <button className="feature-button">Explore</button>
      </div>
    </Link>
  );
};

const features = [
  { title: "Marketing Analysis", path: "/marketing" },
  { title: "Buyer Connection", path: "/buyer-connection" },
  { title: "Global Crop Trends", path: "/crop-trends" },
  { title: "Agricultural Technology", path: "/agri-tech" },
  { title: "Community Network", path: "/community" }
];

const FeaturesSection = () => {
  return (
    <section
      className="features-section"
      style={{ backgroundImage: `url(${farming1})` }} // Background behind everything
    >
      <div className="features-overlay">
        <h2 className="features-title">Agricultural Intelligence</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              path={feature.path}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Home Component
function Home() {
  return (
    <div className="app-container">
      <WeatherApp />
      <AboutUs />
      <FeaturesSection />
      {/* <AgriChat /> */}
      <Footer />
    </div>
  );
}

export default Home;