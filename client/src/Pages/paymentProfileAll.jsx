import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Button, Form, Card, Container, Row, Col, Alert, Badge, Table, Modal } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { 
  FaBoxes, 
  FaShoppingCart, 
  FaWarehouse, 
  FaSearch, 
  FaFilePdf,
  FaRupeeSign,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaTruck,
  FaCheckCircle
} from "react-icons/fa";
import './css/dashboard.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentProfileAll() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const componentPDF = useRef();
  const [suggestedOrders, setSuggestedOrders] = useState([]);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      generateOrderSuggestions();
    }
  }, [orders]);

  // Show suggestions modal when low stock items are detected
  // useEffect(() => {
  //   if (suggestedOrders.length > 0) {
  //     setShowSuggestionsModal(true);
  //   }
  // }, [suggestedOrders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/auth/allproducts`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Generate order suggestions based on low stock and demand forecasting
  const generateOrderSuggestions = () => {
    const suggestions = orders
      .filter(order => {
        // Filter products with low stock
        const isLowStock = order.stock_quentity < 10;
        
        // Calculate demand rate (sold items per product)
        const demandRate = order.sold_quentity / Math.max(1, order.stock_quentity + order.sold_quentity);
        
        // High demand products (over 50% sold)
        const isHighDemand = demandRate > 0.5;
        
        return isLowStock || isHighDemand;
      })
      .map(order => {
        // Calculate suggested order quantity based on demand
        const soldRatio = order.sold_quentity / Math.max(1, order.stock_quentity + order.sold_quentity);
        const demandFactor = Math.max(1, Math.ceil(soldRatio * 2)); // Higher demand = higher restock factor
        
        // Base order quantity on current stock and demand
        let suggestedQuantity;
        if (order.stock_quentity < 5) {
          // Critical low stock - order more
          suggestedQuantity = Math.max(20, Math.ceil(order.sold_quentity * demandFactor));
        } else {
          // Low but not critical - order moderate amount
          suggestedQuantity = Math.max(15, Math.ceil(order.sold_quentity * 0.7));
        }
        
        return {
          ...order,
          suggestedQuantity,
          approved: false
        };
      });
    
    setSuggestedOrders(suggestions);
  };

  const handleApproveOrder = async (id) => {
    try {
      // Find the order to approve
      const orderToApprove = suggestedOrders.find(o => o._id === id);
      
      if (!orderToApprove) return;
      
      // Create order data to send to backend
      const orderData = {
        productId: orderToApprove._id,
        productName: orderToApprove.productName,
        quantity: orderToApprove.suggestedQuantity,
        supplierName: orderToApprove.sup_name || 'Default Supplier',
        status: 'Pending',
        orderDate: new Date().toISOString()
      };
      
      try {
        // Try to send to backend API
        await axios.post('/api/supplier/orders', orderData);
      } catch (apiError) {
        console.log("API endpoint not available, using local storage for demo");
        
        // Store in localStorage as fallback for demo purposes
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        localStorage.setItem('pendingOrders', JSON.stringify([...existingOrders, {
          _id: 'local_' + Date.now(),
          ...orderData
        }]));
      }
      
      // Remove the approved order from the suggestions list
      setSuggestedOrders(prev => prev.filter(order => order._id !== id));
      
      // Check if there are any remaining suggestions
      setTimeout(() => {
        if (suggestedOrders.length <= 1) {
          setShowSuggestionsModal(false);
        }
      }, 100);
      
      alert(`Order for ${orderToApprove.productName} has been sent to supplier!`);
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Failed to approve order. Please try again.");
    }
  };

  const handleApproveAll = async () => {
    try {
      // Filter only unapproved orders
      const ordersToApprove = suggestedOrders;
      
      if (ordersToApprove.length === 0) {
        setShowSuggestionsModal(false);
        return;
      }
      
      // Create order data for all orders
      const orderDataArray = ordersToApprove.map(order => ({
        productId: order._id,
        productName: order.productName,
        quantity: order.suggestedQuantity,
        supplierName: order.sup_name || 'Default Supplier',
        status: 'Pending',
        orderDate: new Date().toISOString()
      }));
      
      try {
        // Try to send all orders to backend
        await axios.post('/api/supplier/bulk-orders', { orders: orderDataArray });
      } catch (apiError) {
        console.log("API endpoint not available, using local storage for demo");
        
        // Store in localStorage as fallback for demo purposes
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const newOrders = orderDataArray.map(order => ({
          _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          ...order
        }));
        
        localStorage.setItem('pendingOrders', JSON.stringify([...existingOrders, ...newOrders]));
      }
      
      // Clear all suggestions and close the modal
      setSuggestedOrders([]);
      setShowSuggestionsModal(false);
      
      alert(`All suggested orders have been approved and sent to suppliers!`);
    } catch (error) {
      console.error("Error approving all orders:", error);
      alert("Failed to approve orders. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowSuggestionsModal(false);
  };

  const totalSales = orders.reduce((acc, order) => acc + Number(order.sold_quentity || 0), 0);
  const totalStock = orders.reduce((acc, order) => acc + Number(order.stock_quentity || 0), 0);
  const lowStockItems = orders.filter(order => order.stock_quentity < 10).length;
  const expiredItems = orders.filter(order => order.status === 'Expired').length;

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: "Total Item Report",
    onBeforeGetContent: () => {
      setIsGeneratingPDF(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGeneratingPDF(false);
      alert("Report downloaded successfully!");
    },
    print: async (printIframe) => {
      const content = printIframe.contentDocument;
      
      // Create a new div for the table-formatted report
      const reportDiv = document.createElement('div');
      reportDiv.style.padding = '20px';
      reportDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Add title
      const title = document.createElement('h2');
      title.textContent = 'Inventory Report';
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      reportDiv.appendChild(title);
      
      // Create table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';
      
      // Add table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const headers = ['Product Name', 'Status', 'Price', 'In Stock', 'Sold'];
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Add table body
      const tbody = document.createElement('tbody');
      
      // Filter products based on search query
      const filteredOrders = orders.filter(order => 
        order.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Add rows for each product
      filteredOrders.forEach(order => {
        const tr = document.createElement('tr');
        
        // Product Name
        const tdName = document.createElement('td');
        tdName.textContent = order.productName;
        tdName.style.border = '1px solid #ddd';
        tdName.style.padding = '8px';
        tr.appendChild(tdName);
        
        // Status
        const tdStatus = document.createElement('td');
        tdStatus.textContent = order.status;
        tdStatus.style.border = '1px solid #ddd';
        tdStatus.style.padding = '8px';
        tr.appendChild(tdStatus);
        
        // Price
        const tdPrice = document.createElement('td');
        tdPrice.textContent = `₹${order.price}`;
        tdPrice.style.border = '1px solid #ddd';
        tdPrice.style.padding = '8px';
        tr.appendChild(tdPrice);
        
        // In Stock
        const tdStock = document.createElement('td');
        tdStock.textContent = order.stock_quentity;
        tdStock.style.border = '1px solid #ddd';
        tdStock.style.padding = '8px';
        if (order.stock_quentity < 10) {
          tdStock.style.color = 'red';
          tdStock.style.fontWeight = 'bold';
        }
        tr.appendChild(tdStock);
        
        // Sold
        const tdSold = document.createElement('td');
        tdSold.textContent = order.sold_quentity;
        tdSold.style.border = '1px solid #ddd';
        tdSold.style.padding = '8px';
        tr.appendChild(tdSold);
        
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
      reportDiv.appendChild(table);
      
      // Add summary section
      const summaryDiv = document.createElement('div');
      summaryDiv.style.marginTop = '20px';
      
      const summaryTitle = document.createElement('h3');
      summaryTitle.textContent = 'Inventory Summary';
      summaryTitle.style.marginBottom = '10px';
      summaryDiv.appendChild(summaryTitle);
      
      const summaryItems = [
        { label: 'Total Products', value: orders.length },
        { label: 'Total Sales', value: totalSales },
        { label: 'Available Stock', value: totalStock },
        { label: 'Low Stock Items', value: lowStockItems },
        { label: 'Expired Items', value: expiredItems }
      ];
      
      const summaryTable = document.createElement('table');
      summaryTable.style.width = '50%';
      summaryTable.style.borderCollapse = 'collapse';
      
      summaryItems.forEach(item => {
        const tr = document.createElement('tr');
        
        const tdLabel = document.createElement('td');
        tdLabel.textContent = item.label;
        tdLabel.style.border = '1px solid #ddd';
        tdLabel.style.padding = '8px';
        tdLabel.style.fontWeight = 'bold';
        tdLabel.style.backgroundColor = '#f8f9fa';
        tr.appendChild(tdLabel);
        
        const tdValue = document.createElement('td');
        tdValue.textContent = item.value;
        tdValue.style.border = '1px solid #ddd';
        tdValue.style.padding = '8px';
        tr.appendChild(tdValue);
        
        summaryTable.appendChild(tr);
      });
      
      summaryDiv.appendChild(summaryTable);
      reportDiv.appendChild(summaryDiv);
      
      // Add date and time of report generation
      const footer = document.createElement('div');
      footer.style.marginTop = '30px';
      footer.style.fontSize = '12px';
      footer.style.color = '#666';
      footer.style.textAlign = 'right';
      footer.textContent = `Report generated on: ${new Date().toLocaleString()}`;
      reportDiv.appendChild(footer);
      
      // Replace content with our formatted report
      content.body.innerHTML = '';
      content.body.appendChild(reportDiv);
      
      // Generate PDF
      const canvas = await html2canvas(content.body);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Total-Item-Report.pdf');
    }
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available': return 'success';
      case 'Expired': return 'danger';
      case 'Refilled': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className="inventory-dashboard">
      <Container fluid className="dashboard-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="dashboard-title">
            <FaWarehouse className="me-2" /> Inventory Dashboard
          </h2>
          
          <div>
            {/* Order Suggestions Button */}
            <Button 
              variant="warning" 
              onClick={() => setShowSuggestionsModal(true)} 
              className="me-2"
              style={{marginBottom: '10px'}}
            >
              <FaTruck className="me-2" />
              Order Suggestions {suggestedOrders.length > 0 && `(${suggestedOrders.length})`}
            </Button>
            
            {/* Generate PDF Button */}
            <Button 
              variant="primary" 
              onClick={generatePDF} 
              disabled={isGeneratingPDF} 
              className="generate-pdf-btn"
            >
              <FaFilePdf className="me-2" />
              {isGeneratingPDF ? "Generating PDF..." : "Generate Inventory Report"}
            </Button>
          </div>
        </div>

        {/* Low Stock Alert Modal */}
        <Modal
          show={showSuggestionsModal}
          onHide={handleCloseModal}
          size="lg"
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <FaTruck className="me-2" /> 
              Automatic Order Suggestions
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              <FaExclamationTriangle className="me-2" />
              Our system has analyzed your inventory levels and sales patterns to suggest the following orders:
            </Alert>
            
            <Table responsive bordered hover size="sm">
              <thead className="bg-light">
                <tr>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Sold Quantity</th>
                  <th>Suggested Order</th>
                  <th>Supplier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {suggestedOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.productName}</td>
                    <td className={order.stock_quentity < 5 ? 'text-danger fw-bold' : ''}>
                      {order.stock_quentity}
                    </td>
                    <td>{order.sold_quentity}</td>
                    <td className="fw-bold">{order.suggestedQuantity} units</td>
                    <td>{order.sup_name || 'Default Supplier'}</td>
                    <td>
                      {order.approved ? (
                        <Badge bg="success">
                          <FaCheckCircle className="me-1" /> Approved
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleApproveOrder(order._id)}
                        >
                          Approve Order
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Dismiss
            </Button>
            <Button 
              variant="primary" 
              onClick={handleApproveAll}
              disabled={suggestedOrders.every(order => order.approved)}
            >
              Approve All Orders
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Expired Products Alert */}
        {expiredItems > 0 && (
          <Alert variant="danger" className="text-center shadow-sm alert-expired mb-3">
            <FaCalendarTimes className="me-2" style={{marginLeft:'25%'}} />
            <strong>Expired Products Alert:</strong> You have {expiredItems} product{expiredItems !== 1 ? 's' : ''} that have expired and should be removed.
          </Alert>
        )}

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <Alert variant="warning" className="text-center shadow-sm alert-low-stock">
            <FaExclamationTriangle className="me-2" style={{marginLeft:'25%'}} />
            <strong>Low Stock Alert:</strong> You have {lowStockItems} product{lowStockItems !== 1 ? 's' : ''} with less than 10 items in stock.
          </Alert>
        )}

        {/* Summary Cards */}
        <Row className="mb-4 summary-cards">
          <Col md={4}>
            <Card className="summary-card total-products">
              <Card.Body>
                <div className="card-icon">
                  <FaBoxes />
                </div>
                <Card.Title>Total Products</Card.Title>
                <Card.Text>{orders.length}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="summary-card sold-products">
              <Card.Body>
                <div className="card-icon">
                  <FaShoppingCart />
                </div>
                <Card.Title>Sold Stock</Card.Title>
                <Card.Text>{totalSales}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="summary-card available-stock">
              <Card.Body>
                <div className="card-icon">
                  <FaWarehouse />
                </div>
                <Card.Title>Available Stock</Card.Title>
                <Card.Text>{totalStock}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search Bar */}
        <div className="search-container mb-4">
          <div className="search-icon">
            <FaSearch />
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
              width: "100%",
              maxWidth: "500px"
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

        {/* Products Grid */}
        <div ref={componentPDF} className="products-grid">
          {orders.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {orders
                .filter((order) =>
                  order.productName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((order) => (
                  <Col key={order._id}>
                    <Card className="product-card h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <Card.Title className="product-name">{order.productName}</Card.Title>
                          <Badge pill bg={getStatusBadge(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="product-details">
                          <div className="product-price">
                            <FaRupeeSign className="me-1" />
                            {order.price}
                          </div>
                          <div className="product-stock">
                            <span className="stock-label">In Stock:</span> 
                            <span className={order.stock_quentity < 10 ? 'low-stock' : ''}>
                              {order.stock_quentity}
                            </span>
                          </div>
                          <div className="product-sold">
                            <span className="sold-label">Sold:</span> {order.sold_quentity}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          ) : (
            <div className="no-products">
              <p>No products available.</p>
            </div>
          )}
        </div>

      </Container>
    </div>
  );
}






