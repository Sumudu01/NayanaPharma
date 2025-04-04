import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {  Modal,  Form } from 'react-bootstrap'; // Using React-Bootstrap components
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust the path as per your project structure
import './css/itemprofile.css';
import { useReactToPrint } from 'react-to-print';
import { Button, Table, Card, Container, Row, Col, Alert } from "react-bootstrap";

export default function ItemProfile() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [orderIdToDelete, setOrderIdToDelete] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const componentPDF = useRef(); // Add reference for PDF generation

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const fetchFirebaseImage = async (imageUrl, field, orderId) => {
    const storageRef = ref(storage, imageUrl);
    try {
      const downloadUrl = await getDownloadURL(storageRef);
      setOrders(prevOrders => prevOrders.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            [field]: downloadUrl
          };
        }
        return order;
      }));
    } catch (error) {
      console.error(`Error fetching image from Firebase for ${field}:`, error);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const res = await fetch(`/api/user/deleteitem/${orderIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderIdToDelete)
        );
      }
      
      setShowModal(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Total Item Report',
    onBeforeGetContent: () => {
      setIsGeneratingPDF(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGeneratingPDF(false);
      alert('Data saved in PDF');
    }
  });

  return (
    <div className="d-flex justify-content-center align-items-center vh-180">
    <Container fluid className="dashboard-container p-10 shadow-lg rounded bg-light" style={{ maxWidth: "60%",marginTop:"9%" }}>

      <h2 className="text-center font-weight-bold text-4xl text-gray-800" style={{fontWeight:'bold'}}>Product Information</h2>
      
      <Form.Control
        type="text"
        placeholder="Search by product name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-2"
      />
      <br></br>

      <div ref={componentPDF} style={{ width: '100%' }}>
        {orders.length > 0 ? (
          <Table striped bordered hover responsive className="shadow-md" style={{width:'80%'}}>
            <thead>
              <tr>
              <th>Supplier Name</th>
                <th>Product Id</th>
                <th>Product Name</th>
                <th>Stock Quentity</th>
                <th>Sold Quentity</th>
                <th>Price</th>
                <th>Status</th>

                {!isGeneratingPDF && <th>Action</th>}
              </tr>
            </thead>
   
            <tbody>
              {orders.filter(order => order.productName.toLowerCase().includes(searchQuery.toLowerCase())).map((order) => (
                <tr key={order._id}>
                  <td>{order.sup_name}</td>

                  <td>{order.ProductId}</td>
                  <td>{order.productName}</td>
                  <td>{order.stock_quentity}</td>
                  <td>{order.sold_quentity}</td>
                  <td>{order.price}</td>
                  <td>{order.status}</td>

                  {!isGeneratingPDF && (
                    <td>
                      <Link to={`/update-item/${order._id}`}>
                        <Button variant="success" id="edit-btn">
                          <b>Edit</b>
                        </Button>
                      </Link>
                      <Button variant="danger" onClick={() => {
                        setShowModal(true);
                        setOrderIdToDelete(order._id);
                      }}>
                        <b>Delete</b>
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>You have no orders yet!</p>
        )}
      </div>

      <br />
      <Button variant="primary" onClick={generatePDF} disabled={isGeneratingPDF}id="genratebtn">
        {isGeneratingPDF ? 'Generating PDF...' : 'Generate Report'}
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-warning" />
          <h3 className="mb-4 text-lg font-normal text-gray-500">
            Are you sure you want to delete this order?
          </h3>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="danger" onClick={handleDeleteOrder}>
              Yes, I am sure
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      </Container>
    </div>
  );
}
