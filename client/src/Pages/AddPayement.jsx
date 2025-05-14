import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import "bootstrap/dist/css/bootstrap.min.css";


export default function AddPayment() {
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [image1, setImage1] = useState(undefined);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    userId: currentUser?._id || '',
    phone: "",
    email: "",
    order:"",
    p_method: "",
    crd_number: "",
    expd_date: "",
    cvv: "",
  });

  useEffect(() => {
    if (image1) {
      handleFileUpload(image1, 'profilePicture');
    }
    fetchOrders();
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
      () => setImageError(true),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData((prev) => ({ ...prev, [field]: downloadURL }));
      }
    );
  };
  
  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/auth/user/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);

      // Fetch images from Firebase for each order
      data.forEach(order => {
        if (order.profilePicture) {
          fetchFirebaseImage(order.profilePicture, 'profilePicture', order._id);
        }
        if (order.alternateProfilePicture) {
          fetchFirebaseImage(order.alternateProfilePicture, 'alternateProfilePicture', order._id);
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cardRegex = /^[0-9]{16}$/;
    const cvvRegex = /^[0-9]{3,4}$/;
    const expDateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

    if (!formData.phone.match(phoneRegex)) errors.phone = "Invalid phone number (10 digits required).";
    if (!formData.email.match(emailRegex)) errors.email = "Invalid email format.";
    if (!formData.crd_number.match(cardRegex)) errors.crd_number = "Card number must be 16 digits.";
    if (!formData.expd_date.match(expDateRegex)) errors.expd_date = "Expiry date must be in MM/YY format.";
    if (!formData.cvv.match(cvvRegex)) errors.cvv = "CVV must be 3 or 4 digits.";
    if (!formData.p_method) errors.p_method = "Payment method is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const res = await fetch('/api/auth/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Payment failed.');
      alert('Payment successful!');
      navigate('/payprofile');
    } catch (error) {
      setError('Something went wrong!');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Payment Form</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input type="text" className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`} placeholder="Phone Number"
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <div className="invalid-feedback">{formErrors.phone}</div>
        </div>
        <select 
  className="form-select" 
  value={formData.order || ""} 
  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
>
  <option value="">Select an Order</option>
  {orders && orders.length > 0 ? (
    orders.map((order) => (
      <option key={order._id} value={order._id}>
        {order.productName}
      </option>
    ))
  ) : (
    <option value="" disabled>No orders available</option>
  )}
</select>


        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`} placeholder="Email Address"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <div className="invalid-feedback">{formErrors.email}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select className={`form-select ${formErrors.p_method ? 'is-invalid' : ''}`} 
            onChange={(e) => setFormData({ ...formData, p_method: e.target.value })}>
            <option value="">Select a payment method</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="PayPal">PayPal</option>
          </select>
          <div className="invalid-feedback">{formErrors.p_method}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Card Number</label>
          <input type="text" className={`form-control ${formErrors.crd_number ? 'is-invalid' : ''}`} placeholder="Card Number"
            onChange={(e) => setFormData({ ...formData, crd_number: e.target.value })} />
          <div className="invalid-feedback">{formErrors.crd_number}</div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Expiry Date (MM/YY)</label>
            <input type="text" className={`form-control ${formErrors.expd_date ? 'is-invalid' : ''}`} placeholder="MM/YY"
              onChange={(e) => setFormData({ ...formData, expd_date: e.target.value })} />
            <div className="invalid-feedback">{formErrors.expd_date}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label">CVV</label>
            <input type="text" className={`form-control ${formErrors.cvv ? 'is-invalid' : ''}`} placeholder="CVV"
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value })} />
            <div className="invalid-feedback">{formErrors.cvv}</div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3 w-100">Submit Payment</button>
      </form>
    </div>
  );
}