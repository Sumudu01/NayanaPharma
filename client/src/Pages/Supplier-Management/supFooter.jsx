import React from "react";
import { Link } from "react-router-dom";
import NayanaPharmaLogo from "./NayanaPharmaLogo.png";
const Footer = () => {
  return (
    <div className="footer-wrapper">
      <div className="footer-section-one">
        <div className="footer-logo-container">
          <p className="logo-container">
            <Link to = "/supDashboard">
                    <p className="logo-container"><img src={NayanaPharmaLogo} alt="logo" className="logo-small"/></p>
                    </Link></p>
          <p className="footer-logo-text">
            Your trusted online pharmacy, providing quality healthcare products and
            services with convenience and reliability. Ensuring your health and well-being
            is our top priority.
          </p>
        </div>
      </div>

      <div className="footer-section-two">
        <div className="footer-section-columns">
          <span>About Us</span>
          <span>Our Services</span>
          <span>FAQs</span>
          <span>Health & Wellness</span>
          <span>Customer Reviews</span>
          <span>Careers</span>
        </div>

        <div className="footer-section-columns">
          <span>+94-77-123-4567</span>
          <span>support@nayanapharmacy.com</span>
          <span>orders@nayanapharmacy.com</span>
          <span>feedback@nayanapharmacy.com</span>
        </div>

        <div className="footer-section-columns">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Refund Policy</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
