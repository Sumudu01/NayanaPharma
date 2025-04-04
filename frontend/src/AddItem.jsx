import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import Swal from "sweetalert2";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Table, Form, Card, Container, Row, Col, Alert } from "react-bootstrap";
import './css/addpet.css'; 
import { Blockquote } from 'flowbite-react';

export default function AddItem() {
  const [imagePercent, setImagePercent] = useState(0);
  const fileRef1 = useRef(null);
  const [imageError, setImageError] = useState(false);
  const [image1, setImage1] = useState(undefined);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    userId: currentUser._id,
    sup_name:"",
    ProductId: "",
    productName: "",
    stock_quentity: "",
    sold_quentity: "",
    price: "",
    status: "",
  });

  useEffect(() => {
    if (image1) {
      handleFileUpload(image1, 'profilePicture');
    }
  }, [image1]);

  const handleFileUpload = async (image, field) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      () => {
        setImageError(true);
        setError('Image upload failed');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            [field]: downloadURL
          }));
        });
      }
    );
  };

  const handleImage1Click = () => {
    fileRef1.current.click();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.ProductId.trim()) errors.ProductId = 'Product ID is required';
    if (!formData.productName.trim()) errors.productName = 'Product Name is required';
    if (!formData.stock_quentity.trim() || isNaN(formData.stock_quentity) || formData.stock_quentity <= 0) 
      errors.stock_quentity = 'Stock quantity must be a positive number';
    if (!formData.sold_quentity.trim() || isNaN(formData.sold_quentity) || formData.sold_quentity < 0) 
      errors.sold_quentity = 'Sold quantity must be 0 or a positive number';
    if (!formData.price.trim() || isNaN(formData.price) || formData.price <= 0) 
      errors.price = 'Price must be a positive number';
    if (!formData.status) errors.status = 'Please select a status';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const res = await fetch('/api/auth/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create item');
      }

      Swal.fire({ icon: "success", title: "Success", text: "Item added successfully!" });
      navigate('/items');
    } catch (error) {
      console.log(error)
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Something went wrong." });
    }
  };

  return (
   <div className="d-flex justify-content-center align-items-center vh-180" >
         <Container fluid className="dashboard-container p-10 shadow-lg rounded bg-light" style={{ maxWidth: "50%", marginLeft: "auto",marginTop:"7%",marginBottom:"2%" }}>
   
      <h2 className="text-center mb-4"style={{fontSize:30,fontWeight:'bold'}}>Add Inventory Product</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow" id="marg1">
      

      <div className="mb-3">
          <label className="form-label">Supplier Name</label>
          <input
            type="text"
            className={`form-control ${formErrors.sup_name ? 'is-invalid' : ''}`}
            placeholder="Enter Supplier Name"
            onChange={(e) => setFormData({ ...formData, sup_name: e.target.value })}
          />
        </div>
        {/* Product ID */}
        <div className="mb-3">
          <label className="form-label">Product ID</label>
          <input
            type="text"
            className={`form-control ${formErrors.ProductId ? 'is-invalid' : ''}`}
            placeholder="Enter Product ID"
            onChange={(e) => setFormData({ ...formData, ProductId: e.target.value })}
          />
          <div className="invalid-feedback">{formErrors.ProductId}</div>
        </div>

        {/* Product Name */}
        <div className="mb-3">
          <label className="form-label">Product Name</label>
          <input
            type="text"
            className={`form-control ${formErrors.productName ? 'is-invalid' : ''}`}
            placeholder="Enter Product Name"
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          />
          <div className="invalid-feedback">{formErrors.productName}</div>
        </div>

        {/* Stock Quantity */}
        <div className="mb-3">
          <label className="form-label">Stock Quantity</label>
          <input
            type="number"
            className={`form-control ${formErrors.stock_quentity ? 'is-invalid' : ''}`}
            placeholder="Enter Stock Quantity"
            onChange={(e) => setFormData({ ...formData, stock_quentity: e.target.value })}
          />
          <div className="invalid-feedback">{formErrors.stock_quentity}</div>
        </div>

        {/* Sold Quantity */}
        <div className="mb-3">
          <label className="form-label">Sold Quantity</label>
          <input
            type="number"
            className={`form-control ${formErrors.sold_quentity ? 'is-invalid' : ''}`}
            placeholder="Enter Sold Quantity"
            onChange={(e) => setFormData({ ...formData, sold_quentity: e.target.value })}
          />
          <div className="invalid-feedback">{formErrors.sold_quentity}</div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
            placeholder="Enter Price"
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <div className="invalid-feedback">{formErrors.price}</div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            className={`form-select ${formErrors.status ? 'is-invalid' : ''}`}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="">Select Status</option>
            <option>Available</option>
            <option>Expired</option>
            <option>Refilled</option>
          </select>
          <div className="invalid-feedback">{formErrors.status}</div>
        </div>

        <button type="submit" className="btn btn-primary w-100" id="submit-button">Add Product</button>
      </form>
      </Container>
    </div>
  );
}
