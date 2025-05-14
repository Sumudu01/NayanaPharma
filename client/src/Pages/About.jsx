import React from 'react';
import { FaClinicMedical, FaUsers, FaShieldAlt, FaChartLine, FaMobileAlt, FaDatabase, FaCapsules } from 'react-icons/fa';
import { MdHealthAndSafety, MdPayment, MdSupportAgent } from 'react-icons/md';
import { RiCustomerService2Fill } from 'react-icons/ri';
import './css/About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Banner */}
      <div className="about-hero">
        <h1>About Nayana Pharma PMS</h1>
        <p>Empowering pharmacies with innovative management solutions</p>
      </div>

      {/* Main Content */}
      <div className="about-content">
        {/* System Overview */}
        <section className="about-section">
          <h2><FaClinicMedical /> Our System</h2>
          <p>
            Nayana Pharma PMS is a comprehensive pharmacy management solution designed to streamline 
            operations, improve patient care, and enhance business performance. Our system integrates 
            all aspects of pharmacy management into one intuitive platform.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <FaCapsules className="feature-icon" />
              <h3>Inventory Management</h3>
              <p>Real-time tracking of medications with expiration alerts and automated reordering</p>
            </div>
            
            <div className="feature-card">
              <MdPayment className="feature-icon" />
              <h3>Billing & Insurance</h3>
              <p>Seamless billing with insurance processing and multiple payment options</p>
            </div>
            
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Patient Management</h3>
              <p>Complete patient profiles with medication history and allergy tracking</p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="about-section">
          <h2><FaShieldAlt /> Key Features</h2>
          <ul className="features-list">
            <li><FaDatabase /> Centralized database for all pharmacy operations</li>
            <li><FaMobileAlt /> Mobile-friendly interface for on-the-go access</li>
            <li><FaShieldAlt /> HIPAA-compliant security and data protection</li>
            <li><FaChartLine /> Advanced analytics and reporting tools</li>
            <li><RiCustomerService2Fill /> Customer loyalty program integration</li>
            <li><MdSupportAgent /> 24/7 technical support</li>
          </ul>
        </section>

        {/* Our Mission */}
        <section className="about-section mission">
          <h2><MdHealthAndSafety /> Our Mission</h2>
          <p>
            At Nayana Pharma, we're committed to bridging the gap between pharmaceutical expertise 
            and digital innovation. Our mission is to provide pharmacies with tools that enhance 
            operational efficiency while maintaining the highest standards of patient care.
          </p>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <h2>Ready to transform your pharmacy?</h2>
          <button className="cta-button">Request a Demo</button>
        </section>
      </div>
    </div>
  );
};

export default About;