import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Alert } from 'react-bootstrap';
import EditSaleForm from './EditSaleForm'; // You'll need to create this component

const SalesReport = ({ serverStatus = false }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);
  const navigate = useNavigate();

  // Sample data for when server is offline
  const SAMPLE_SALES = [
    { _id: '1', date: '2023-05-01', customerName: 'John Doe', items: 3, totalAmount: 1250 },
    { _id: '2', date: '2023-05-02', customerName: 'Jane Smith', items: 5, totalAmount: 2100 },
    { _id: '3', date: '2023-05-03', customerName: 'Bob Johnson', items: 2, totalAmount: 850 },
    { _id: '4', date: '2023-05-04', customerName: 'Alice Brown', items: 4, totalAmount: 1750 },
    { _id: '5', date: '2023-05-05', customerName: 'Charlie Davis', items: 1, totalAmount: 450 }
  ];

  useEffect(() => {
    fetchSales();
  }, [serverStatus]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      if (!serverStatus) {
        // Use sample data if server is offline
        setSales(SAMPLE_SALES);
        setLoading(false);
        return;
      }
      
      const response = await api.get('/sales');
      // Ensure we're setting an array
      setSales(Array.isArray(response.data) ? response.data :
              (response.data?.sales || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales data');
      setSales(serverStatus ? [] : SAMPLE_SALES);
    } finally {
      setLoading(false);
    }
  };

  // Delete sale handler
  const handleDelete = async () => {
    try {
      await api.delete(`/sales/${saleToDelete}`);
      setSales(sales.filter(sale => sale._id !== saleToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  // Edit sale handler
  const handleEdit = (sale) => {
    setSaleToEdit(sale);
    setShowEditModal(true);
  };

  // Update sale handler
  const handleUpdate = async (updatedSale) => {
    try {
      const response = await api.put(`/sales/${updatedSale._id}`, updatedSale);
      setSales(sales.map(sale => 
        sale._id === updatedSale._id ? response.data : sale
      ));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Sales Report</h2>
        
        {loading && <Alert variant="info">Loading sales data...</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {sales.length === 0 && !loading && !error ? (
          <p>No sales data available.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer ID</th>
                  <th>Medicines</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td>{sale.customerId}</td>
                    <td>
                      <ul>
                        {sale.medicines.map((medicine, index) => (
                          <li key={index}>
                            {medicine.medicineId?.name || 'Medicine not found'} - 
                            {medicine.quantity} x ${medicine.price}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>${sale.totalAmount}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(sale)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setSaleToDelete(sale._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this sale record? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Sale</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {saleToEdit && (
              <EditSaleForm 
                sale={saleToEdit} 
                onUpdate={handleUpdate} 
                onCancel={() => setShowEditModal(false)} 
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default SalesReport;
