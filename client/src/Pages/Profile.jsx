import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { Button, Table, Form, Card, Container, Row, Col, Alert, Spinner } from "react-bootstrap";

import {
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signout
} from '../redux/User/userSlice';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './css/profile.css'; 

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const { currentUser, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);

  const handleFileUpload = async (image) => {
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
      (error) => {
        setImageError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, profilePicture: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
      alert('User deleted successfully');
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout');
      dispatch(signout());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container className="profile-container py-5">
      <Card className="profile-card shadow-lg rounded-4 border-0">
        <Card.Body className="p-md-5 p-4">
          <h2 className="text-center mb-4 fw-bold text-primary">My Profile</h2>
          <div className="text-center mb-4">
            <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            <div className="profile-image-container mx-auto mb-3">
              <img
                src={formData.profilePicture || currentUser.profilePicture}
                alt="profile"
                className="profile-image"
                onClick={() => fileRef.current.click()}
              />
              <div className="profile-image-overlay">
                <span>Change Photo</span>
              </div>
            </div>
            {imageError ? (
              <Alert variant="danger" className="upload-alert">Error uploading image (Max 2MB)</Alert>
            ) : imagePercent > 0 && imagePercent < 100 ? (
              <Alert variant="info" className="upload-alert">
                <div className="progress">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{width: `${imagePercent}%`}}
                    aria-valuenow={imagePercent} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <small>Uploading: {imagePercent}%</small>
              </Alert>
            ) : imagePercent === 100 ? (
              <Alert variant="success" className="upload-alert">Image uploaded successfully</Alert>
            ) : null}
          </div>

          <Form onSubmit={handleSubmit} className="profile-form">
            <Form.Group className="mb-3 form-floating">
              <Form.Control 
                defaultValue={currentUser.username} 
                type="text" 
                id="username" 
                placeholder="Username" 
                onChange={handleChange}
                className="form-control-lg"
              />
              <label htmlFor="username">Username</label>
            </Form.Group>
            <Form.Group className="mb-3 form-floating">
              <Form.Control 
                defaultValue={currentUser.email} 
                type="email" 
                id="email" 
                placeholder="Email" 
                onChange={handleChange}
                className="form-control-lg"
              />
              <label htmlFor="email">Email</label>
            </Form.Group>
            <Form.Group className="mb-4 form-floating">
              <Form.Control 
                type="password" 
                id="password" 
                placeholder="Password" 
                onChange={handleChange}
                className="form-control-lg"
              />
              <label htmlFor="password">Password</label>
            </Form.Group>
            <Button 
              variant="primary" 
              className="w-100 py-2 fw-bold" 
              type="submit" 
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Update Profile'}
            </Button>
          </Form>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-danger" onClick={handleDeleteAccount} className="action-btn">
              <i className="fas fa-user-times me-2"></i>Close Account
            </Button>
            <Button variant="outline-secondary" onClick={handleSignOut} className="action-btn">
              <i className="fas fa-sign-out-alt me-2"></i>Sign Out
            </Button>
          </div>

          <div className="mt-5">
            <h5 className="text-center mb-3 fw-bold">Quick Actions</h5>
            <div className="quick-links">
              <Link to="/inventory/add" className="quick-link-card">
                <div className="quick-link-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <span>Add Product</span>
              </Link>
              <Link to="/inventory/list" className="quick-link-card">
                <div className="quick-link-icon">
                  <i className="fas fa-boxes"></i>
                </div>
                <span>My Products</span>
              </Link>
            </div>
          </div>

          {error && <Alert variant="danger" className="mt-4 text-center">Something went wrong</Alert>}
          {updateSuccess && <Alert variant="success" className="mt-4 text-center">User updated successfully</Alert>}
        </Card.Body>
      </Card>
    </Container>
  );
}
