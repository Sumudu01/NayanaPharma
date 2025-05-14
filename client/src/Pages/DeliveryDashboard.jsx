import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DeliveryDashboard.css';

// Sample fallback data
const SAMPLE_DELIVERIES = [
  { 
    _id: '1', 
    supplierName: 'PharmaCorp', 
    medicineName: 'Paracetamol', 
    quantity: 500, 
    pickupDate: '2023-06-15', 
    deliveryDate: '2023-06-18' 
  },
  { 
    _id: '2', 
    supplierName: 'MediSupply', 
    medicineName: 'Amoxicillin', 
    quantity: 200, 
    pickupDate: '2023-06-16', 
    deliveryDate: '2023-06-19' 
  },
  { 
    _id: '3', 
    supplierName: 'HealthPlus', 
    medicineName: 'Ibuprofen', 
    quantity: 300, 
    pickupDate: '2023-06-17', 
    deliveryDate: '2023-06-20' 
  }
];

const SAMPLE_ALERTS = [
  { 
    message: '🚚 500 units of Paracetamol from PharmaCorp are due for delivery today!' 
  },
  { 
    message: '🚚 200 units of Vitamin C from HealthPlus are due for delivery today!' 
  }
];

const Dashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [todayAlerts, setTodayAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Check if server is available first
      try {
        // Set a short timeout to quickly determine if server is available
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await axios.get('http://localhost:5000/api/health-check', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setServerStatus(true);
        
        // If server is available, fetch actual data
        try {
          const [deliveriesResponse, alertsResponse] = await Promise.all([
            axios.get('http://localhost:5000/api/deliveries'),
            axios.get('http://localhost:5000/api/inventory/today-deliveries')
          ]);
          
          setDeliveries(deliveriesResponse.data);
          setTodayAlerts(alertsResponse.data);
          setError(null);
        } catch (dataError) {
          console.error('Error fetching data:', dataError);
          setError('Connected to server but failed to fetch data. Displaying sample data.');
          setDeliveries(SAMPLE_DELIVERIES);
          setTodayAlerts(SAMPLE_ALERTS);
        }
      } catch (serverError) {
        // Server is not available, use sample data
        console.log('Server unavailable, using sample data');
        setServerStatus(false);
        setError('Server is currently unavailable. Displaying sample data for demonstration purposes.');
        setDeliveries(SAMPLE_DELIVERIES);
        setTodayAlerts(SAMPLE_ALERTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🚚 Delivery Dashboard</h1>
      
      {/* Server Status Indicator - now hidden */}
      {/* <div className={`server-status ${serverStatus ? 'online' : 'offline'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {serverStatus ? 'Server Online' : 'Server Offline - Demo Mode'}
        </span>
      </div> */}
      
      {/* Error message - now hidden */}
      {/* {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )} */}

      {/* Loading indicator */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading delivery data...</p>
        </div>
      ) : (
        <>
          {/* Today's Alerts */}
          {todayAlerts.length > 0 && (
            <div className="alert-box">
              <h4>📅 Deliveries Scheduled for Today:</h4>
              <ul>
                {todayAlerts.map((alert, index) => (
                  <li key={index}>{alert.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Delivery Table */}
          <div className="table-container">
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Pickup Date</th>
                  <th>Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length > 0 ? (
                  deliveries.map((d, i) => (
                    <tr key={i}>
                      <td>{d.supplierName}</td>
                      <td>{d.medicineName}</td>
                      <td>{d.quantity}</td>
                      <td>{d.pickupDate}</td>
                      <td>{d.deliveryDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No deliveries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
