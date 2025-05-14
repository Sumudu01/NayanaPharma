import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Alert, Button } from 'react-bootstrap';
import { FaUserAlt, FaShoppingCart, FaClipboardList, FaSearch, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import MedicineSearch from '../components/MedicineSearch';
import Cart from '../components/Cart';
import api from 'axios';
import './css/billing.css';

const Home = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([
    { _id: '1', name: 'Walk-in Customer', phone: '', email: 'walk-in@example.com' },
    { _id: '2', name: 'John Doe', phone: '1234567890', email: 'john@example.com' },
    { _id: '3', name: 'Jane Smith', phone: '9876543210', email: 'jane@example.com' },
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  // Function to add item to cart
  const addToCart = async (medicine) => {
    try {
      setError('');
      // Check if we already have this item in the cart
      const existingItem = cartItems.find((item) => item._id === medicine._id);
      
      if (existingItem) {
        // If item exists, increase quantity by 1
        const newQuantity = existingItem.quantity + 1;
        
        // Make sure we don't exceed available stock
        if (newQuantity > medicine.stock_quentity) {
          setError('Cannot add more of this item. Stock limit reached.');
          return;
        }
        
        // Update stock in the backend
        await api.put(`/api/user/updateitem`, {
          id: medicine._id,
          stock_quentity: 69, // Decrease stock by 1
          sold_quentity: 1, // Increase sold quantity by 1
          isIncrement: true
        });
        
        // Update cart state
        setCartItems(prevItems =>
          prevItems.map(item =>
            item._id === medicine._id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        
        // Update the medicine in the UI to reflect decreased stock
        medicine.stock_quentity -= 1;
      } else {
        // If item doesn't exist in cart, add it with quantity 1
        
        // Make sure we have stock available
        if (medicine.stock_quentity <= 0) {
          setError('This item is out of stock.');
          return;
        }
        
        // Update stock in the backend
        await api.put(`/api/user/updateitem`, {
          id: medicine._id,
          stock_quentity: -1, // Decrease stock by 1
          sold_quentity: 1, // Increase sold quantity by 1
          isIncrement: true
        });
        
        // Add to cart with quantity 1
        setCartItems(prevItems => [
          ...prevItems,
          { ...medicine, quantity: 1 }
        ]);
        
        // Update the medicine in the UI to reflect decreased stock
        medicine.stock_quentity -= 1;
      }
      
      setSuccess(`Added ${medicine.productName} to cart`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Trigger a refresh of the medicine list to show updated stock
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('cart-updated');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  // Function to handle adding a new customer
  const handleAddNewCustomer = () => {
    // Validate form
    if (!newCustomer.name.trim()) {
      setError('Customer name is required');
      return;
    }

    // Generate a unique ID (in a real app, this would come from the backend)
    const newId = `new-${Date.now()}`;
    
    // Create the new customer object
    const customerToAdd = {
      _id: newId,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      email: newCustomer.email.trim()
    };
    
    // Add to customers list
    setCustomers(prev => [...prev, customerToAdd]);
    
    // Select the new customer
    setSelectedCustomer(customerToAdd);
    
    // Reset form and hide it
    setNewCustomer({ name: '', phone: '', email: '' });
    setShowNewCustomerForm(false);
    
    // Show success message
    setSuccess('New customer added successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Function to handle Add New Product button click
  const handleAddNewProduct = () => {
    navigate('/inventory/add');
  };

  return (
    <div className="billing-page">
      <Container fluid className="py-4 px-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="page-title">
                <FaClipboardList className="me-2" />
                Billing Dashboard
              </h2>
              <div className="d-flex">
                <Button variant="outline-secondary" className="me-2">
                  Today's Sales
                </Button>
                <Button variant="outline-primary">
                  Billing History
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                {success}
              </Alert>
            )}
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm customer-card">
              <Card.Header className="bg-primary text-white d-flex align-items-center">
                <FaUserAlt className="me-2" />
                <h4 className="mb-0">Customer Information</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <Form.Group className="flex-grow-1 me-2">
                        <Form.Label>Select Customer</Form.Label>
                        <Form.Select 
                          onChange={(e) => {
                            if (e.target.value === "new") {
                              setShowNewCustomerForm(true);
                              setSelectedCustomer(null);
                            } else {
                              const customer = customers.find(c => c._id === e.target.value);
                              setSelectedCustomer(customer);
                              setShowNewCustomerForm(false);
                            }
                          }}
                          value={selectedCustomer?._id || ''}
                          className="customer-select"
                        >
                          <option value="">-- Select Customer --</option>
                          {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name}
                            </option>
                          ))}
                          <option value="new">+ Add New Customer</option>
                        </Form.Select>
                      </Form.Group>
                      <Button 
                        variant="outline-primary" 
                        className="customer-search-btn"
                        style={{ marginTop: '32px' }}
                      >
                        <FaSearch />
                      </Button>
                    </div>
                    
                    {showNewCustomerForm && (
                      <div className="new-customer-form p-3 border rounded bg-light">
                        <h5 className="mb-3">Add New Customer</h5>
                        <Form.Group className="mb-2">
                          <Form.Label>Name*</Form.Label>
                          <Form.Control 
                            type="text" 
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                            placeholder="Enter customer name"
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control 
                            type="text" 
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                            placeholder="Enter phone number"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control 
                            type="email" 
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                            placeholder="Enter email address"
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => {
                              setShowNewCustomerForm(false);
                              setNewCustomer({ name: '', phone: '', email: '' });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={handleAddNewCustomer}
                          >
                            Add Customer
                          </Button>
                        </div>
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    {selectedCustomer ? (
                      <div className="customer-info p-3 border rounded">
                        <h5 className="mb-3">Customer Details</h5>
                        <div className="customer-detail-row">
                          <span className="customer-detail-label">Name:</span>
                          <span className="customer-detail-value">{selectedCustomer.name}</span>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="customer-detail-row">
                            <span className="customer-detail-label">Phone:</span>
                            <span className="customer-detail-value">{selectedCustomer.phone}</span>
                          </div>
                        )}
                        {selectedCustomer.email && (
                          <div className="customer-detail-row">
                            <span className="customer-detail-label">Email:</span>
                            <span className="customer-detail-value">{selectedCustomer.email}</span>
                          </div>
                        )}
                        <div className="customer-detail-row">
                          <span className="customer-detail-label">Previous Purchases:</span>
                          <span className="customer-detail-value">3</span>
                        </div>
                        <div className="customer-detail-row">
                          <span className="customer-detail-label">Last Visit:</span>
                          <span className="customer-detail-value">2023-05-15</span>
                        </div>
                      </div>
                    ) : (
                      <div className="customer-info-placeholder p-3 border rounded text-center text-muted">
                        <p className="mb-0">Select a customer to view details</p>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm product-card mb-4">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaClipboardList className="me-2" />
                  <h4 className="mb-0">Available Products</h4>
                </div>
                <Link to="/inventory/add">
                  <Button variant="light" size="sm">
                    <FaPlus className="me-1" /> Add New Product
                  </Button>
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                <MedicineSearch addToCart={addToCart} cartItems={cartItems} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="shadow-sm cart-card">
              <Card.Header className="bg-primary text-white d-flex align-items-center">
                <FaShoppingCart className="me-2" />
                <h4 className="mb-0">Shopping Cart</h4>
              </Card.Header>
              <Card.Body className="p-0">
                <Cart 
                  cartItems={cartItems} 
                  setCartItems={setCartItems} 
                  selectedCustomer={selectedCustomer}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
