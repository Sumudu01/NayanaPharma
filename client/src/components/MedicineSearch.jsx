import React, { useState, useEffect } from 'react';
import { Card, Form, InputGroup, Table, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaExclamationTriangle, FaShoppingCart } from 'react-icons/fa';
import api from 'axios';
import './MedicineSearch.css';

const MedicineSearch = ({ addToCart, cartItems = [] }) => {
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
    
    // Add event listener for cart updates
    const handleCartUpdate = () => {
      fetchMedicines();
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/auth/allproducts');
      
      if (Array.isArray(response.data)) {
        setMedicines(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const medicinesArray = response.data.items || [];
        setMedicines(medicinesArray);
      } else {
        setMedicines([]);
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real-time available stock by subtracting cart quantities
  const getRealTimeStock = (medicine) => {
    const cartItem = cartItems.find(item => item._id === medicine._id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    return medicine.stock_quentity - cartQuantity;
  };

  // Safely filter medicines
  const filteredMedicines = Array.isArray(medicines) 
    ? medicines.filter(medicine => 
        medicine.productName && 
        medicine.productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handle adding to cart with real-time stock check
  const handleAddToCart = async (medicine) => {
    const realTimeStock = getRealTimeStock(medicine);
    
    if (realTimeStock <= 0) {
      alert('This item is out of stock.');
      return;
    }
    
    await addToCart(medicine);
  };

  return (
    <Card className="medicine-search-card mb-4">
      <Card.Header className="search-header">
        <h4 className="header-title">Available Products</h4>
      </Card.Header>
      <Card.Body>
        <Form className="search-form mb-4">
          <InputGroup>
            <InputGroup.Text className="search-icon-container">
              <FaSearch className="search-icon" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </InputGroup>
        </Form>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="no-results">
            <p>No products found. Try a different search term.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="product-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>In Stock</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine, index) => {
                  const realTimeStock = getRealTimeStock(medicine);
                  const inCart = cartItems.some(item => item._id === medicine._id);
                  
                  return (
                    <tr key={medicine._id || index} className={realTimeStock <= 0 ? 'out-of-stock-row' : ''}>
                      <td className="product-name">{medicine.productName}</td>
                      <td className="product-price">${medicine.price}</td>
                      <td>{medicine.stock_quentity}</td>
                      <td className={`stock-cell ${realTimeStock < 10 ? 'low-stock' : ''}`}>
                        {realTimeStock}
                        {inCart && (
                          <Badge bg="info" className="cart-badge">In Cart</Badge>
                        )}
                      </td>
                      <td>
                        <Button 
                          variant={realTimeStock <= 0 ? "outline-danger" : "success"} 
                          size="sm" 
                          onClick={() => handleAddToCart(medicine)}
                          disabled={realTimeStock <= 0}
                          className="add-to-cart-btn"
                        >
                          {realTimeStock <= 0 ? (
                            <>
                              <FaExclamationTriangle className="btn-icon" />
                              <span>Out of Stock</span>
                            </>
                          ) : (
                            <>
                              <FaShoppingCart className="btn-icon" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MedicineSearch;
