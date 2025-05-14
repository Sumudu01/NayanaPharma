import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Table, Container, Alert, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { HiOutlineExclamationCircle, HiSearch, HiDocumentDownload } from "react-icons/hi";
import { FaEdit, FaTrash, FaChartBar, FaExclamationTriangle, FaCalendarTimes } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import './css/itemprofile.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ItemProfile() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [products, setProducts] = useState([]);
  const [productIdToDelete, setProductIdToDelete] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showChartModal, setShowChartModal] = useState(false);
  
  const allProductsRef = useRef();
  const lowStockRef = useRef();
  const expiredRef = useRef();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/allproducts');
      if (response.data) {
        setProducts(response.data);
      } else {
        setError('No products found');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await axios.delete(`/api/user/deleteitem/${productIdToDelete}`);
      if (res.data) {
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productIdToDelete)
        );
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting product:', error.message);
      alert(`Error deleting product: ${error.message}`);
      setShowModal(false);
    }
  };

  // Filter products based on active tab
  const filteredProducts = products.filter(product => {
    // First apply search filter
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sup_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply tab filter
    switch (activeTab) {
      case 'lowStock':
        return product.stock_quentity < 10;
      case 'expired':
        return product.status.toLowerCase() === 'expired';
      default:
        return true; // 'all' tab
    }
  });

  // Generate PDF for all products
  const generateAllProductsPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setActiveTab('all');
      
      // Wait for the tab to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const content = allProductsRef.current;
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('All-Products-Inventory-Report.pdf');
      
      alert('All Products Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Generate PDF for low stock products
  const generateLowStockPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setActiveTab('lowStock');
      
      // Wait for the tab to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const content = lowStockRef.current;
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Low-Stock-Products-Report.pdf');
      
      alert('Low Stock Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Generate PDF for expired products
  const generateExpiredPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setActiveTab('expired');
      
      // Wait for the tab to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const content = expiredRef.current;
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Expired-Products-Report.pdf');
      
      alert('Expired Products Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Prepare data for low stock chart
  const getLowStockChartData = () => {
    const lowStockProducts = products.filter(product => product.stock_quentity < 10);
    
    // Group by supplier
    const supplierGroups = {};
    lowStockProducts.forEach(product => {
      if (!supplierGroups[product.sup_name]) {
        supplierGroups[product.sup_name] = {
          name: product.sup_name,
          count: 0,
          totalMissing: 0
        };
      }
      supplierGroups[product.sup_name].count += 1;
      supplierGroups[product.sup_name].totalMissing += (10 - product.stock_quentity);
    });
    
    return Object.values(supplierGroups);
  };

  // Prepare data for pie chart
  const getLowStockPieData = () => {
    const statusCounts = {
      'Available': 0,
      'Expired': 0,
      'Refilled': 0,
      'Low Stock': 0
    };
    
    products.forEach(product => {
      if (product.stock_quentity < 10) {
        statusCounts['Low Stock'] += 1;
      } else {
        statusCounts[product.status] = (statusCounts[product.status] || 0) + 1;
      }
    });
    
    return Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));
  };

  return (
    <div className="item-profile-container">
      <Container fluid className="landscape-container" style={{marginTop:'5%'}}>
        <div className="header-section">
          <h2 className="page-title" style={{marginLeft:'35%'}}>Product Inventory</h2>

          <div className="search-section">
            <div className="search-icon">
              <HiSearch />
            </div>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{
                padding: "12px 15px 12px 45px",
                borderRadius: "30px",
                border: "2px solid #e0e0e0",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                fontSize: "16px",
                transition: "all 0.3s ease",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                e.target.style.border = "2px solid #3498db";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.border = "2px solid #e0e0e0";
                e.target.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
              }}
            />
          </div>
          
          <div className="action-buttons mb-3" style={{marginTop:'5%'}}>
            <Button 
              variant="info" 
              onClick={() => setShowChartModal(true)} 
              className="me-2"
            >
              <FaChartBar className="me-1" /> Stock Analysis
            </Button>
            
            {/* Replace dropdown with separate buttons */}
            <Button 
              variant="primary" 
              onClick={generateAllProductsPDF}
              className="me-2"
              disabled={isGeneratingPDF}
            >
              <HiDocumentDownload className="me-1" /> All Products Report
            </Button>
            
            <Button 
              variant="warning" 
              onClick={generateLowStockPDF}
              className="me-2"
              disabled={isGeneratingPDF}
            >
              <FaExclamationTriangle className="me-1" /> Low Stock Report
            </Button>
            
            <Button 
              variant="danger" 
              onClick={generateExpiredPDF}
              className="me-2"
              disabled={isGeneratingPDF}
            >
              <FaCalendarTimes className="me-1" /> Expired Products Report
            </Button>
            
            <Link to="/inventory/add">
              <Button variant="success">
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="all" title="All Products">
            {/* All Products Tab Content */}
          </Tab>
          <Tab eventKey="lowStock" title={
            <span>
              <FaExclamationTriangle className="text-warning me-1" />
              Low Stock ({products.filter(p => p.stock_quentity < 10).length})
            </span>
          }>
            {/* Low Stock Tab Content */}
          </Tab>
          <Tab eventKey="expired" title={
            <span>
              <FaCalendarTimes className="text-danger me-1" />
              Expired ({products.filter(p => p.status.toLowerCase() === 'expired').length})
            </span>
          }>
            {/* Expired Tab Content */}
          </Tab>
        </Tabs>

        {loading ? (
          <div className="text-center my-4">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <div className="table-responsive">
            {filteredProducts.length > 0 ? (
              <div>
                {/* All Products Table */}
                <div ref={allProductsRef} style={{ display: activeTab === 'all' ? 'block' : 'none' }}>
                  <h3 className="report-title">All Products Inventory Report</h3>
                  <Table striped bordered hover responsive className="inventory-table">
                    <thead className="table-header">
                      <tr>
                        <th style={{color:'black',textAlign:'center',fontWeight:'bold'}}>Supplier</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Product ID</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Product Name</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>In Stock</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Sold</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Price ($)</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Price (LKR)</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Status</th>
                        {!isGeneratingPDF && <th className="actions-column" style={{color:'black', textAlign:'center', fontWeight:'bold'}}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td>{product.sup_name}</td>
                          <td>{product.ProductId}</td>
                          <td>{product.productName}</td>
                          <td className={product.stock_quentity < 10 ? 'low-stock' : ''}>
                            {product.stock_quentity}
                          </td>
                          <td>{product.sold_quentity}</td>
                          <td>$ {product.price.toLocaleString()}</td>
                          <td>LKR {(product.price * 320).toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${product.status.toLowerCase()}`}>
                              {product.status}
                            </span>
                          </td>
                          {!isGeneratingPDF && (
                            <td className="action-buttons">
                              <Link to={`/inventory/update/${product._id}`}>
                                <Button variant="outline-primary" size="sm" className="action-btn">
                                  <FaEdit /> Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="action-btn ms-2"
                                onClick={() => {
                                  setProductIdToDelete(product._id);
                                  setShowModal(true);
                                }}
                              >
                                <FaTrash /> Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                {/* Low Stock Products Table */}
                <div ref={lowStockRef} style={{ display: activeTab === 'lowStock' ? 'block' : 'none' }}>
                  <h3 className="report-title">Low Stock Products Report</h3>
                  <Alert variant="warning">
                    <FaExclamationTriangle className="me-2" />
                    These products have less than 10 items in stock and need to be refilled soon.
                  </Alert>
                  <Table striped bordered hover responsive className="inventory-table">
                    <thead className="table-header">
                      <tr>
                        <th style={{color:'black',textAlign:'center',fontWeight:'bold'}}>Supplier</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Product ID</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Product Name</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>In Stock</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Sold</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Price ($)</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Price (LKR)</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Status</th>
                        {!isGeneratingPDF && <th className="actions-column" style={{color:'black', textAlign:'center', fontWeight:'bold'}}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td>{product.sup_name}</td>
                          <td>{product.ProductId}</td>
                          <td>{product.productName}</td>
                          <td className="low-stock">
                            {product.stock_quentity}
                          </td>
                          <td>{product.sold_quentity}</td>
                          <td>$ {product.price.toLocaleString()}</td>
                          <td>LKR {(product.price * 320).toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${product.status.toLowerCase()}`}>
                              {product.status}
                            </span>
                          </td>
                          {!isGeneratingPDF && (
                            <td className="action-buttons">
                              <Link to={`/inventory/update/${product._id}`}>
                                <Button variant="outline-primary" size="sm" className="action-btn">
                                  <FaEdit /> Edit 
                                </Button>
                              </Link>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="action-btn ms-2"
                                onClick={() => {
                                  setProductIdToDelete(product._id);
                                  setShowModal(true);
                                }}
                              >
                                <FaTrash /> Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                {/* Expired Products Table */}
                <div ref={expiredRef} style={{ display: activeTab === 'expired' ? 'block' : 'none' }}>
                  <h3 className="report-title">Expired Products Report</h3>
                  <Alert variant="danger">
                    <FaCalendarTimes className="me-2" />
                    These products have expired and should be removed from inventory.
                  </Alert>
                  <Table striped bordered hover responsive className="inventory-table">
                    <thead className="table-header">
                      <tr>
                        <th style={{color:'black',textAlign:'center',fontWeight:'bold'}}>Supplier</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Product ID</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Product Name</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>In Stock</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Sold</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Price ($)</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Price (LKR)</th>
                        <th style={{color:'black',textAlign:'center', fontWeight:'bold'}}>Status</th>
                        {!isGeneratingPDF && <th className="actions-column" style={{color:'black', textAlign:'center', fontWeight:'bold'}}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td>{product.sup_name}</td>
                          <td>{product.ProductId}</td>
                          <td>{product.productName}</td>
                          <td className={product.stock_quentity < 10 ? 'low-stock' : ''}>
                            {product.stock_quentity}
                          </td>
                          <td>{product.sold_quentity}</td>
                          <td>$ {product.price.toLocaleString()}</td>
                          <td>LKR {(product.price * 320).toLocaleString()}</td>
                          <td>
                            <span className="status-badge expired">
                              {product.status}
                            </span>
                          </td>
                          {!isGeneratingPDF && (
                            <td className="action-buttons">
                              <Link to={`/inventory/update/${product._id}`}>
                                <Button variant="outline-primary" size="sm" className="action-btn">
                                  <FaEdit /> Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="action-btn ms-2"
                                onClick={() => {
                                  setProductIdToDelete(product._id);
                                  setShowModal(true);
                                }}
                              >
                                <FaTrash /> Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            ) : (
              <Alert variant="info">No products found matching your criteria.</Alert>
            )}
          </div>
        )}
      </Container>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center">
            <HiOutlineExclamationCircle className="text-warning me-2" size={24} />
            <p className="mb-0">Are you sure you want to delete this product? This action cannot be undone.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Chart Modal */}
      <Modal
        show={showChartModal}
        onHide={() => setShowChartModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Stock Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="supplier" id="chart-tabs">
            <Tab eventKey="supplier" title="Low Stock by Supplier">
              <div className="chart-container" style={{ height: '400px', marginTop: '20px' }}>
                <h5 className="text-center mb-4">Low Stock Products by Supplier</h5>
                {getLowStockChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getLowStockChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="Number of Products" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="totalMissing" name="Units Needed" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center">
                    <p>No low stock products found.</p>
                  </div>
                )}
              </div>
            </Tab>
            <Tab eventKey="status" title="Product Status Distribution">
              <div className="chart-container" style={{ height: '400px', marginTop: '20px' }}>
                <h5 className="text-center mb-4">Product Status Distribution</h5>
                {getLowStockPieData().some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getLowStockPieData().filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getLowStockPieData().filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center">
                    <p>No product data available.</p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChartModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
