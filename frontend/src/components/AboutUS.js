import React from "react";
import "../styles/AboutUs.css";
import farmingImage from "../assets/farming3.jpg"; // Ensure the path is correct

const AboutUs = () => {
  return (
    <section className="about-section">
      <div className="overlay-text">
        <div className="left">

        <h2 className="about-title">🌍 AI-Powered Agriculture</h2>
        <p className="about-intro">
          We revolutionize farming with <strong>AI-driven solutions</strong> to enhance <strong>productivity, sustainability, and food security.</strong>
          Empowering smallholder farmers with <strong>real-time insights.</strong>
        </p>

        <h3 className="about-subtitle">🔹 Our Mission:</h3>
        <ul className="about-list">
          <li>🌾 <strong>Optimize crop growth</strong> with AI-based monitoring.</li>
          <li>🔬 <strong>Detect pests & diseases</strong> using computer vision.</li>
          <li>📊 <strong>Analyze market trends</strong> for better decision-making.</li>
          <li>🌍 <strong>Enhance sustainability</strong> through smart resource use.</li>
          <li>🤝 <strong>Connect farmers, governments, & industries</strong> for seamless collaboration.</li>
        </ul>

        <p className="about-impact">
          Affordable, scalable AI solutions for a <strong>sustainable agricultural future.</strong> 🚀
        </p>
        </div>
        <div className="right">
        <img src={farmingImage} alt="Farming" className="farming-img" />
      </div>
      </div>
    </section>
  );
};

export default AboutUs;