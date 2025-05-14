import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Card, Row, Col, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { FaChartLine, FaCalendarAlt, FaDownload, FaFilter } from 'react-icons/fa';
import api from 'axios';
import './css/salesreport.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Sample data for when server is unavailable
const SAMPLE_SALES = [
  { _id: '1', customerId: 'CUST001', totalAmount: 125.50, medicines: [{}, {}, {}], createdAt: new Date() },
  { _id: '2', customerId: 'CUST002', totalAmount: 78.25, medicines: [{}, {}], createdAt: new Date() },
  { _id: '3', customerId: 'CUST003', totalAmount: 210.00, medicines: [{}, {}, {}, {}], createdAt: new Date() }
];

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      // Set a short timeout to quickly determine if server is available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      try {
        await api.get('http://localhost:5000/api/health-check', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setServerStatus(true);
        
        // If server is available, fetch actual data
        const response = await api.get('http://localhost:5000/api/sales');
        setSales(Array.isArray(response.data) ? response.data : 
                (response.data?.sales || []));
      } catch (serverError) {
        console.log('Server unavailable, using sample data');
        setServerStatus(false);
        // Remove setting the error message for server unavailability
        // setError('Server is currently unavailable. Displaying sample data for demonstration purposes.');
        setSales(SAMPLE_SALES);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales data');
      setSales(SAMPLE_SALES);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSales = () => {
    return Array.isArray(sales)
      ? sales.reduce((total, sale) => total + (sale?.totalAmount || 0), 0)
      : 0;
  };

  const handleExportReport = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Create a new jsPDF instance
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);
      doc.text('Sales Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add summary section
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Sales Summary', 14, 45);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Sales: $${calculateTotalSales().toFixed(2)}`, 14, 55);
      doc.text(`Total Transactions: ${sales.length}`, 14, 62);
      doc.text(`Average Sale: $${sales.length > 0 ? (calculateTotalSales() / sales.length).toFixed(2) : '0.00'}`, 14, 69);
      
      // Add server status if offline
      if (!serverStatus) {
        doc.setTextColor(255, 0, 0);
        doc.text('Note: Server Offline - Demo Mode', 14, 80);
      }
      
      // Add transactions table
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Sales Transactions', 14, 95);
      
      // Table headers
      const headers = [['ID', 'Date', 'Customer', 'Items', 'Amount']];
      
      // Table data
      const data = sales.map(sale => [
        `#${sale?._id || 'N/A'}`.substring(0, 8),
        sale?.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A',
        sale?.customerId || 'N/A',
        `${sale?.medicines?.length || 0} items`,
        `$${(sale?.totalAmount || 0).toFixed(2)}`
      ]);
      
      // Create the table
      doc.autoTable({
        startY: 100,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { 
          fillColor: [67, 97, 238],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 100 }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 287, { align: 'center' });
      }
      
      // Save the PDF
      doc.save('sales-report.pdf');
      
      alert('Sales report has been generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Spinner animation="border" />
    </div>
  );

  return (
    <div className="sales-report-page">
      <Container fluid className="py-4 px-4" ref={reportRef}>
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="page-title">
                <FaChartLine className="me-2" />
                Sales Report
              </h2>
              <div className="d-flex">
                <Button 
                  variant="outline-primary" 
                  className="me-2" 
                  onClick={handleExportReport}
                  disabled={isGeneratingPDF}
                >
                  <FaDownload className="me-1" /> 
                  {isGeneratingPDF ? 'Generating...' : 'Export Report'}
                </Button>
              </div>
            </div>
            {/* Remove the server offline message but keep error messages */}
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Col>
        </Row>

        {/* Filter Section */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={3}>
                    <div className="d-flex align-items-center">
                      <FaFilter className="me-2 text-primary" />
                      <h5 className="mb-0">Filter Sales</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Range</Form.Label>
                      <Form.Select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control type="date" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>End Date</Form.Label>
                          <Form.Control type="date" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm summary-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Sales</h6>
                    <h3 className="mb-0">${calculateTotalSales().toFixed(2)}</h3>
                  </div>
                  <div className="icon-container bg-primary">
                    <FaChartLine className="text-white" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm summary-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Transactions</h6>
                    <h3 className="mb-0">{Array.isArray(sales) ? sales.length : 0}</h3>
                  </div>
                  <div className="icon-container bg-success">
                    <FaCalendarAlt className="text-white" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm summary-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Average Sale</h6>
                    <h3 className="mb-0">
                      ${sales.length > 0 ? (calculateTotalSales() / sales.length).toFixed(2) : '0.00'}
                    </h3>
                  </div>
                  <div className="icon-container bg-info">
                    <FaChartLine className="text-white" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sales Table */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Sales Transactions</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Customer ID</th>
                      <th>Items</th>
                      <th className="text-end">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(sales) && sales.map((sale) => (
                      <tr key={sale?._id}>
                        <td>#{sale?._id || 'N/A'}</td>
                        <td>{sale?.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>{sale?.customerId || 'N/A'}</td>
                        <td>{sale?.medicines?.length || 0} items</td>
                        <td className="text-end fw-bold">${(sale?.totalAmount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SalesReport;
