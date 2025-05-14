import React, { useState } from 'react';
import { Button, ListGroup, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import api from 'axios';

const Cart = ({ cartItems, setCartItems, selectedCustomer }) => {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Function to update stock in the backend
  const updateStock = async (itemId, quantity, isDecrease) => {
    try {
      await api.put(`/api/user/updateitem`, {
        id: itemId,
        stock_quentity: isDecrease ? -quantity : quantity,
        sold_quentity: isDecrease ? quantity : -quantity
      });
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock. Please try again.');
      return false;
    }
  };

  // Function to update item quantity
  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    const quantityDiff = newQuantity - item.quantity;
    
    try {
      // Check if we have enough stock for the increase
      if (quantityDiff > 0) {
        // Fetch the latest stock information
        const response = await api.get(`/api/user/getitem/${item._id}`);
        const currentStock = response.data.data.stock_quentity;
        
        // Calculate real-time available stock
        const availableStock = currentStock - item.quantity;
        
        if (quantityDiff > availableStock) {
          setError('Cannot add more of this item. Stock limit reached.');
          return;
        }
      }
      
      // Update stock based on quantity change
      const success = await updateStock(item._id, Math.abs(quantityDiff), quantityDiff > 0);
      
      if (success) {
        // Update cart item quantity
        setCartItems(prevItems =>
          prevItems.map(cartItem =>
            cartItem._id === item._id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          )
        );
        setError('');
        
        // Trigger a refresh of the medicine list to show updated stock
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('cart-updated');
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
    }
  };

  // Function to remove an item from the cart
  const removeFromCart = async (item) => {
    try {
      // First update the stock in the backend (increase stock, decrease sold)
      const success = await updateStock(item._id, item.quantity, false);
      
      if (success) {
        // Then remove the item from the cart
        setCartItems(prevItems => prevItems.filter(cartItem => cartItem._id !== item._id));
        setError('');
        
        // Trigger a refresh of the medicine list to show updated stock
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('cart-updated');
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer before checkout.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Cart is empty. Please add items before checkout.');
      return;
    }

    setProcessing(true);
    try {
      // Here you would implement the actual checkout logic
      // For example, creating an order in the database
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear cart after successful checkout
      setCartItems([]);
      setError('');
      alert('Checkout successful! Order has been placed.');
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="cart-container">
      {error && (
        <Alert variant="danger" className="m-3">
          {error}
        </Alert>
      )}
      
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
          <small>Add products to get started</small>
        </div>
      ) : (
        <>
          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={item._id} className="cart-item">
                <Row className="align-items-center">
                  <Col xs={12} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="cart-item-name">{item.productName}</span>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => removeFromCart(item)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="quantity-control">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </Button>
                      <Form.Control
                        type="text"
                        value={item.quantity}
                        readOnly
                        size="sm"
                      />
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </Col>
                  <Col xs={6} className="text-end">
                    <span className="cart-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="text-muted small">
                      ${item.price} each
                    </div>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          <div className="cart-total">
            <Row className="align-items-center">
              <Col>
                <span className="cart-total-label">Total:</span>
              </Col>
              <Col className="text-end">
                <span className="cart-total-amount">${totalPrice.toFixed(2)}</span>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Button 
                  variant="success" 
                  className="w-100" 
                  onClick={handleCheckout}
                  disabled={processing || cartItems.length === 0}
                >
                  <FaMoneyBillWave className="me-2" />
                  {processing ? 'Processing...' : 'Checkout'}
                </Button>
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
