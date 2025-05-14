import React, { useState, useEffect } from 'react';
import SalesReport from '../components/SalesReport';
import { Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

// Sample fallback data
const SAMPLE_SALES_DATA = [
  { _id: '1', date: '2023-06-15', customerName: 'John Doe', items: 5, totalAmount: 1850 },
  { _id: '2', date: '2023-06-16', customerName: 'Jane Smith', items: 3, totalAmount: 1200 },
  { _id: '3', date: '2023-06-17', customerName: 'Robert Johnson', items: 7, totalAmount: 2750 },
  { _id: '4', date: '2023-06-18', customerName: 'Emily Davis', items: 2, totalAmount: 950 },
  { _id: '5', date: '2023-06-19', customerName: 'Michael Brown', items: 4, totalAmount: 1650 }
];

const SalesReportPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Set a short timeout to quickly determine if server is available
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await axios.get('http://localhost:5000/api/health-check', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setServerStatus(true);
      } catch (error) {
        console.log('Server unavailable, using sample data');
        setServerStatus(false);
        setError('Server is currently unavailable. Displaying sample data for demonstration purposes.');
      } finally {
        setLoading(false);
      }
    };

    checkServerStatus();
    setRefresh((prev) => !prev);
  }, []);

  return (
    <div className="sales-report-page">
      <h2>Sales Report</h2>
      
      {/* Server Status Indicator */}
      {!serverStatus && (
        <Alert variant="warning">
          <div className="server-status-indicator offline">
            <span className="status-dot"></span>
            <span className="status-text">Server Offline - Demo Mode</span>
          </div>
          {error && <p>{error}</p>}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <SalesReport key={refresh} serverStatus={serverStatus} fallbackData={SAMPLE_SALES_DATA} />
      )}
    </div>
  );
};

export default SalesReportPage;
