import React from "react";
import "./AgriculturalTechnology.css";

const AgriculturalTechnology = () => {
  const trends = [
    "Precision Agriculture",
    "AI and Machine Learning in Farming",
    "Vertical and Urban Farming",
    "Drones for Crop Monitoring",
    "Blockchain for Supply Chain Transparency",
    "IoT-based Smart Irrigation",
    "CRISPR and Genetic Engineering",
    "Agri-Robotics for Automation",
    "Hydroponics and Aeroponics",
    "Climate-Resilient Crops",
  ];

  const indiaTrends = [
    "Government-backed AgriTech Startups",
    "Digital Marketplaces for Farmers (eNAM, AgriBazaar)",
    "AI-driven Pest Detection and Prevention",
    "IoT-based Soil and Weather Monitoring",
    "Drone-based Pesticide Spraying",
    "Farm Mechanization with Smart Tools",
    "Organic and Sustainable Farming Initiatives",
    "FPOs (Farmer Producer Organizations) Empowerment",
    "Microfinance and Agri-credit Solutions",
    "Smart Warehousing and Cold Storage Solutions",
  ];

  const news = [
    { date: "2025-03-24", title: "AI-driven Pest Control", pdf: "ai-pest-control.pdf" },
    { date: "2025-03-18", title: "Govt Launches Digital Marketplace", pdf: "digital-marketplace.pdf" },
    { date: "2025-03-15", title: "Drones in Crop Monitoring", pdf: "drones-crop-monitoring.pdf" },
    { date: "2025-03-10", title: "Rise of Hydroponics", pdf: "hydroponics-trend.pdf" },
  ];

  return (
    <div className="container">
      <h1 className="title">Agricultural Technology</h1>
      <p className="subtitle">Explore the latest advancements in agricultural technology globally and locally.</p>
      
      <div className="section">
        <h2 className="section-title">Global Trends</h2>
        <ul className="list">
          {trends.map((trend, index) => (
            <li key={index}>{trend}</li>
          ))}
        </ul>
      </div>
      
      <div className="section">
        <h2 className="section-title">Agricultural Trends in India</h2>
        <ul className="list">
          {indiaTrends.map((trend, index) => (
            <li key={index}>{trend}</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Latest News</h2>
        <ul className="news-list">
          {news.map((item, index) => (
            <li key={index} className="news-item">
              <p className="news-date">{item.date}:</p> {item.title} 
              <a href={item.pdf} className="news-pdf" target="_blank" rel="noopener noreferrer">[PDF]</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgriculturalTechnology;