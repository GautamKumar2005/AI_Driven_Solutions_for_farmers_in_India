import React from 'react';
import '../styles/Footer.css'; // Adjust the path as necessary

const Footer = () => {
  return (
    <footer className="footerSectionContainer">
      <div className="footerContentWrapper">
        <div className="footerGridLayout">
          <div className="footerContentBlock">
            <h3 className="footerTitleHeader">
              <span className="footerTitleIcon">🌿</span> AgriConnect
            </h3>
            <p className="footerDescriptionText">
              Revolutionizing agriculture with artificial intelligence and data-driven insights.
            </p>
            <div className="footerSocialLinks">
              <a href="https://www.facebook.com" className="socialMediaAnchor" aria-label="Facebook">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiXN9xSEe8unzPBEQOeAKXd9Q55efGHGB9BA&s" alt="Facebook" className="socialMediaIcon" />
              </a>
              <a href="https://www.twitter.com" className="socialMediaAnchor" aria-label="Twitter">
                <img src="https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg" alt="Twitter" className="socialMediaIcon" />
              </a>
              <a href="https://www.instagram.com" className="socialMediaAnchor" aria-label="Instagram">
                <img src="https://i.pinimg.com/564x/1e/d6/e0/1ed6e0a9e69176a5fdb7e090a1046b86.jpg" alt="Instagram" className="socialMediaIcon" />
              </a>
            </div>
          </div>
          <div className="footerContentBlock">
            <h3 className="footerHeadingTitle">Government Links</h3>
            <ul className="footerLinksList">
              <li><a href="https://www.india.gov.in/topics/agriculture" className="footerLinkItem">Indian Government - Agriculture</a></li>
              <li><a href="https://nfsm.gov.in/" className="footerLinkItem">National Food Security Mission</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footerBottomSection">
        <p>&copy; 2025 AgriConnect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;