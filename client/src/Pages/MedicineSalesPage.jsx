import React, { useEffect, useState } from 'react';
import api from '../axios';

const MedicineSalesPage = () => {
  const [medicineSales, setMedicineSales] = useState([]);

  // Fetch medicine sales data from the backend
  useEffect(() => {
    const fetchMedicineSales = async () => {
      try {
        const response = await api.get('/medicine-sales');
        setMedicineSales(response.data);
      } catch (error) {
        console.error('Error fetching medicine sales:', error);
      }
    };
    fetchMedicineSales();
  }, []);

  return (
    <div>
      <h2>Medicine Sales</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Medicine</th>
            <th>Quantity</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {medicineSales.map((sale) => (
            <tr key={sale._id}>
              <td>{new Date(sale.date).toLocaleDateString()}</td>
              <td>{sale.medicineName}</td>
              <td>{sale.totalQuantity}</td>
              <td>${sale.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicineSalesPage;