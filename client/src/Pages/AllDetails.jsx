import React from 'react';
import { Link } from 'react-router-dom';
import './css/allshop.css';

export default function AllDetails() {
  return (
    <div className="shop-home">
      
      {/* Hero Section */}
      <div className="hero">
        <h1></h1>
        <p></p>
        <button className="cta-button"><Link to="/allproducts"></Link></button>
      </div>

      {/* Categories Section */}
      <div className="categories">
        <h2></h2>
        <div className="category-list">
          <div className="category-card"></div>
          <div className="category-card"></div>
          <div className="category-card"></div>
          <div className="category-card"></div>
          <div className="category-card"></div>
          <div className="category-card"></div>
        </div>
      </div>

     
      <div className="featured-products">
        <h2></h2>
        <div className="product-grid">
          <div className="product-card">
            <img src="/images/product1.jpg" alt="Product 1" />
            <h3></h3>
            <p></p>
            <button className="add-to-cart"></button>
          </div>
          <div className="product-card">
            <img src="/images/product2.jpg" alt="Product 2" />
            <h3></h3>
            <p></p>
            <button className="add-to-cart"></button>
          </div>
          <div className="product-card">
            <img src="/images/product3.jpg" alt="Product 3" />
            <h3></h3>
            <p></p>
            <button className="add-to-cart"></button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits">
        <h2></h2>
        <div className="benefit-list">
          <div className="benefit-card"></div>
          <div className="benefit-card"></div>
          <div className="benefit-card"></div>
          <div className="benefit-card"></div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <h2></h2>
        <ol>
          <li><strong></strong> </li>
          <li><strong></strong> </li>
          <li><strong></strong> </li>
          <li><strong></strong> </li>
        </ol>
      </div>

      {/* Customer Testimonials Section */}
      <div className="testimonials">
        <h2></h2>
        <div className="testimonial-card">
          <p></p>
          <strong></strong>
        </div>
        <div className="testimonial-card">
          <p></p>
          <strong></strong>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="cta-section">
        <h2></h2>
        <p></p>
        <button className="cta-button"><Link to="/shop-now"></Link></button>
      </div>
      
    </div>
  );
}
