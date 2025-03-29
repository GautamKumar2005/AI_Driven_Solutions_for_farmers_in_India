import React, { useState } from "react";
import "./community.css";
import { FaUsers, FaComments, FaHandshake, FaMapMarkerAlt, FaUser, FaSearch } from "react-icons/fa";

const farmers = [
  { name: "Rajesh Sharma", location: "Punjab, India", expertise: "Organic Farming" },
  { name: "Meena Patel", location: "Gujarat, India", expertise: "Irrigation Techniques" },
  { name: "Arjun Verma", location: "Maharashtra, India", expertise: "Dairy Farming" },
  { name: "Sunita Rao", location: "Karnataka, India", expertise: "Crop Rotation" },
];

const FarmersNetwork = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="network-container">
      <h1 className="network-title">🌾 Farmers Network</h1>
      <p className="network-subtitle">
        Connect, share insights, and collaborate with fellow farmers, experts, and industry leaders.
      </p>

      {/* Search Bar */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search Farmers by Name..." 
          className="search-input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Features Section */}
      <div className="network-features">
        <div className="feature-box">
          <FaUsers className="icon-feature" />
          <h2>Find Connections</h2>
          <p>Discover and network with farmers and agritech experts in your region.</p>
        </div>

        <div className="feature-box">
          <FaComments className="icon-feature" />
          <h2>Discussion Forum</h2>
          <p>Engage in discussions, ask questions, and exchange farming techniques.</p>
        </div>

        <div className="feature-box">
          <FaHandshake className="icon-feature" />
          <h2>Collaborations</h2>
          <p>Partner with industry leaders, government agencies, and agri-tech startups.</p>
        </div>
      </div>

      {/* Farmer Profiles */}
      <h2 className="section-heading">🌍 Farmers in Your Network</h2>
      <div className="farmer-list">
        {filteredFarmers.map((farmer, index) => (
          <div key={index} className="farmer-card">
            <FaUser className="farmer-icon" />
            <h3>{farmer.name}</h3>
            <p>
              <FaMapMarkerAlt className="location-marker" /> {farmer.location}
            </p>
            <p><strong>Expertise:</strong> {farmer.expertise}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmersNetwork;