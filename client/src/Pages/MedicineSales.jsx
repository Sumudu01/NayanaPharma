import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Row, Col } from 'react-bootstrap';

const MedicineSales = () => {
  const [medicineSales, setMedicineSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicineSales();
  }, []);

  const fetchMedicineSales = async () => {
    try {
      const response = await api.get('/medicine-sales');
      setMedicineSales(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch medicine sales data');
      setLoading(false);
    }
  };

  const calculateTotalSold = () => {
    return medicineSales.reduce((total, sale) => total + sale.totalSold, 0);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Medicine Sales Analysis</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col>
              <h4>Total Medicines Sold</h4>
              <h3>{calculateTotalSold()}</h3>
            </Col>
            <Col>
              <h4>Unique Products</h4>
              <h3>{medicineSales.length}</h3>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Total Sold</th>
            <th>Current Stock</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {medicineSales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.productName}</td>
              <td>{sale.totalSold}</td>
              <td>{sale.currentStock}</td>
              <td>${sale.totalRevenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default MedicineSales; 