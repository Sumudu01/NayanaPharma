import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Delete, Visibility, CloudOff, Cloud } from "@mui/icons-material";
import './sup_all.css';

// Sample fallback data
const SAMPLE_SUPPLIERS = [
  {
    _id: "s1",
    SupplierName: "PharmaCorp",
    SupplierContact: "123-456-7890",
    SupplierEmail: "contact@pharmacorp.com",
    SupplierType: "Pharmaceutical",
    SupplierStatus: "Active",
    SupplierContractStartDate: "2023-01-15"
  },
  {
    _id: "s2",
    SupplierName: "MediSupply",
    SupplierContact: "987-654-3210",
    SupplierEmail: "info@medisupply.com",
    SupplierType: "Medical Equipment",
    SupplierStatus: "Active",
    SupplierContractStartDate: "2023-02-20"
  },
  {
    _id: "s3",
    SupplierName: "HealthPlus",
    SupplierContact: "555-123-4567",
    SupplierEmail: "support@healthplus.com",
    SupplierType: "Healthcare",
    SupplierStatus: "Inactive",
    SupplierContractStartDate: "2022-11-10"
  }
];

function AllSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(false);
  const navigate = useNavigate();

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      
      try {
        setServerStatus(true);
        const response = await axios.get("http://localhost:3000/supplier/");
        setSuppliers(response.data);
        setLoading(false);
        setError(null);
      } catch (serverError) {
        console.log('Server unavailable, using sample data');
        setServerStatus(false);
        setError('Server is currently unavailable. Displaying sample data for demonstration purposes.');
        setSuppliers(SAMPLE_SUPPLIERS);
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      if (!serverStatus) {
        setSuppliers(suppliers.filter(supplier => supplier._id !== id));
        return;
      }
      
      axios.delete(`http://localhost:3000/supplier/delete/${id}`)
        .then(response => {
          console.log("Supplier deleted:", response.data);
          setSuppliers(suppliers.filter(supplier => supplier._id !== id));
        })
        .catch(error => {
          console.error("Error deleting supplier:", error);
          alert("Failed to delete supplier. Server may be unavailable.");
        });
    }
  };

  const handleView = (id) => {
    navigate(`/supplier/${id}`); 
  };

  return (
    <div className="supplier-management-container">
      <div className="supplier-header">
        <h1 className="supplier-title">Supplier Management</h1>
        <div className={`server-status ${serverStatus ? 'online' : 'offline'}`}>
          {serverStatus ? (
            <>
              <Cloud className="status-icon" />
              <span>Server Online</span>
            </>
          ) : (
            <>
              <CloudOff className="status-icon" />
              <span>Server Offline - Demo Mode</span>
            </>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <div className="loading-container">
          <CircularProgress size={60} thickness={4} className="loading-spinner" />
          <p>Loading supplier data...</p>
        </div>
      ) : (
        <Paper elevation={3} className="supplier-table-container">
          <TableContainer>
            <Table stickyHeader aria-label="suppliers table">
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Supplier Name</TableCell>
                  <TableCell className="table-header">Contact</TableCell>
                  <TableCell className="table-header">Email</TableCell>
                  <TableCell className="table-header">Type</TableCell>
                  <TableCell className="table-header">Status</TableCell>
                  <TableCell className="table-header">Contract Start</TableCell>
                  <TableCell className="table-header actions-header">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow 
                    key={supplier._id}
                    hover
                    className="supplier-row"
                  >
                    <TableCell className="supplier-name">{supplier.SupplierName}</TableCell>
                    <TableCell>{supplier.SupplierContact}</TableCell>
                    <TableCell>
                      <a href={`mailto:${supplier.SupplierEmail}`} className="email-link">
                        {supplier.SupplierEmail}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={supplier.SupplierType} 
                        size="small" 
                        className="type-chip"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={supplier.SupplierStatus} 
                        size="small" 
                        className={`status-chip ${supplier.SupplierStatus.toLowerCase()}`}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(supplier.SupplierContractStartDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="actions-cell">
                      <Tooltip title="View details">
                        <IconButton 
                          onClick={() => handleView(supplier._id)}
                          color="primary"
                          className="action-btn view-btn"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete supplier">
                        <IconButton 
                          onClick={() => handleDelete(supplier._id)}
                          color="error"
                          className="action-btn delete-btn"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </div>
  );
}

export default AllSuppliers;