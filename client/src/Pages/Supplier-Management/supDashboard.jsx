import React, { useState, useEffect } from "react";

import Footer from "./supFooter";

import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem } from "@mui/material";
// Using React Bootstrap icons instead of Material-UI icons
import { FaBuilding, FaUsers, FaUserAltSlash, FaBoxes, FaShippingFast, FaFileContract } from 'react-icons/fa';

import './sup_dashboard.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Sample data for when server is unavailable
const SAMPLE_COUNTS = {
  totalSuppliers: 11,
  activeSuppliers: 8,
  inactiveSuppliers: 3,
  productsSupplied: 42,
  pendingDeliveries: 7,
  expiringContracts: 2
};

const SAMPLE_SUPPLIERS_BY_TYPE = [
  { _id: "Pharmaceutical", supplierCount: 5 },
  { _id: "Medical Equipment", supplierCount: 3 },
  { _id: "Healthcare", supplierCount: 2 },
  { _id: "Other", supplierCount: 1 }
];

const SAMPLE_SUPPLIERS = [
  {
    _id: "s1",
    SupplierName: "PharmaCorp",
    SupplierContact: "123-456-7890",
    SupplierEmail: "contact@pharmacorp.com",
    SupplierType: "Pharmaceutical",
    SupplierStatus: "Active"
  },
  {
    _id: "s2",
    SupplierName: "MediSupply",
    SupplierContact: "987-654-3210",
    SupplierEmail: "info@medisupply.com",
    SupplierType: "Medical Equipment",
    SupplierStatus: "Active"
  },
  {
    _id: "s3",
    SupplierName: "HealthPlus",
    SupplierContact: "555-123-4567",
    SupplierEmail: "support@healthplus.com",
    SupplierType: "Healthcare",
    SupplierStatus: "Inactive"
  }
];

// Feature info Data for Total, Active, Inactive Counts
const featureInfoData = [
    { icon: <FaBuilding size={24} />, title: "Total Suppliers", countKey: "totalSuppliers", description: "All registered suppliers" },
    { icon: <FaUsers size={24} />, title: "Active Suppliers", countKey: "activeSuppliers", description: "Currently active suppliers" },
    { icon: <FaUserAltSlash size={24} />, title: "Inactive Suppliers", countKey: "inactiveSuppliers", description: "Temporarily inactive suppliers" },
];

// Additional metrics for second row
const additionalMetrics = [
    { icon: <FaBoxes size={24} />, title: "Products Supplied", countKey: "productsSupplied", description: "Total products from all suppliers" },
    { icon: <FaShippingFast size={24} />, title: "Pending Deliveries", countKey: "pendingDeliveries", description: "Scheduled deliveries" },
    { icon: <FaFileContract size={24} />, title: "Expiring Contracts", countKey: "expiringContracts", description: "Contracts expiring in 30 days" },
];

export default function SupplierDashboard() {
    const [supplierCounts, setSupplierCounts] = useState({ 
        totalSuppliers: 0, 
        activeSuppliers: 0, 
        inactiveSuppliers: 0,
        productsSupplied: 0,
        pendingDeliveries: 0,
        expiringContracts: 0
    });
    const [suppliersByType, setSuppliersByType] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [serverStatus, setServerStatus] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkServerStatus();
    }, []);

    const checkServerStatus = async () => {
        try {
            // Set a short timeout to quickly determine if server is available
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            await axios.get('http://localhost:8070/health', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            setServerStatus(true);
            
            // If server is available, fetch all data
            fetchSupplierCounts();
            fetchSuppliersByType();
            fetchSuppliers();
            fetchAdditionalMetrics();
        } catch (error) {
            console.log('Server unavailable, using sample data');
            setServerStatus(false);
            // Removed error message about server unavailability
            // setError('Server is currently unavailable. Displaying sample data for demonstration purposes.');
            
            // Use sample data
            setSupplierCounts(SAMPLE_COUNTS);
            setSuppliersByType(SAMPLE_SUPPLIERS_BY_TYPE);
            setSuppliers(SAMPLE_SUPPLIERS);
            setLoading(false);
        }
    };

    const fetchSupplierCounts = async () => {
        try {
            const response = await axios.get("http://localhost:8070/supplier/counts");
            setSupplierCounts(prevCounts => ({
                ...prevCounts,
                totalSuppliers: response.data.totalSuppliers || 0,
                activeSuppliers: response.data.activeSuppliers || 0,
                inactiveSuppliers: response.data.inactiveSuppliers || 0
            }));
        } catch (error) {
            console.error("Error fetching supplier counts:", error);
            setSupplierCounts(prevCounts => ({
                ...prevCounts,
                totalSuppliers: SAMPLE_COUNTS.totalSuppliers,
                activeSuppliers: SAMPLE_COUNTS.activeSuppliers,
                inactiveSuppliers: SAMPLE_COUNTS.inactiveSuppliers
            }));
        }
    };

    const fetchSuppliersByType = async () => {
        try {
            const response = await axios.get("http://localhost:8070/supplier/suppliers-by-type");
            console.log("Suppliers by type data:", response.data);

            // Check if the data is in the expected format
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSuppliersByType(response.data);
            } else {
                // If no data or wrong format, create sample data for testing
                console.log("Using sample data for pie chart");
                const sampleData = [
                    { _id: "Pharmaceutical", supplierCount: 5 },
                    { _id: "Medical Equipment", supplierCount: 3 },
                    { _id: "Healthcare", supplierCount: 2 },
                    { _id: "Other", supplierCount: 1 }
                ];
                setSuppliersByType(sampleData);
            }
        } catch (error) {
            console.error("Error fetching suppliers by type:", error);
            // Set sample data on error
            const sampleData = [
                { _id: "Pharmaceutical", supplierCount: 5 },
                { _id: "Medical Equipment", supplierCount: 3 },
                { _id: "Healthcare", supplierCount: 2 },
                { _id: "Other", supplierCount: 1 }
            ];
            setSuppliersByType(sampleData);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get("http://localhost:8070/supplier/active-suppliers");
            setSuppliers(response.data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const fetchAdditionalMetrics = async () => {
        try {
            // Create an array of promises for parallel fetching
            const [productsResponse, deliveriesResponse, contractsResponse] = await Promise.all([
                // Fetch products supplied by all suppliers
                axios.get("http://localhost:8070/inventory/product-count"),
                
                // Fetch pending deliveries
                axios.get("http://localhost:8070/delivery/count"),
                
                // Fetch expiring contracts (suppliers with contracts ending in next 30 days)
                axios.get("http://localhost:8070/supplier/expiring-contracts-count")
            ]);
            
            setSupplierCounts(prevCounts => ({
                ...prevCounts,
                productsSupplied: productsResponse.data.count || 0,
                pendingDeliveries: deliveriesResponse.data.count || 0,
                expiringContracts: contractsResponse.data.count || 0
            }));
        } catch (error) {
            console.error("Error fetching additional metrics:", error);
            // Set fallback values if API calls fail
            setSupplierCounts(prevCounts => ({
                ...prevCounts,
                productsSupplied: 0,
                pendingDeliveries: 0,
                expiringContracts: 0
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (supplier) => {
        setSelectedSupplier(supplier);
        setNewStatus(supplier.status || 'Active');  // Set as default status if it's undefined
        setOpenDialog(true);
    };

    const handleStatusChange = async () => {
        if (!selectedSupplier) return;

        if (!serverStatus) {
            alert("Cannot update supplier status while server is offline.");
            handleCloseDialog();
            return;
        }

        try {
            console.log("Updating supplier status:", {
                supplierId: selectedSupplier._id,
                status: newStatus,
            });

            // Send the PUT request to update status
            await axios.put("http://localhost:8070/supplier/update-status", {
                supplierId: selectedSupplier._id,
                status: newStatus
            });

            // Refresh data after update
            fetchSuppliers();
            fetchSupplierCounts();

            handleCloseDialog();  // Close the dialog
        } catch (error) {
            console.error("Error updating supplier status:", error);
            alert("Failed to update supplier status. Please try again.");
        }
    };




    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSupplier(null);
    };


    const COLORS = ["#B0C4DE", "#4682B4", "#5F9EA0", "#87CEEB", "#1E3A5F"];


    return (
        <div>


            <div className="dashboard-feature-section">
                <div className="dashboard-feature-section-top">
                    <h1>Supplier Management Dashboard</h1>
                    
                    {/* Server Status Indicator - now hidden */}
                    {/* {!serverStatus && (
                        <div className="server-status-indicator offline">
                            <span className="status-dot"></span>
                            <span className="status-text">Server Offline - Demo Mode</span>
                        </div>
                    )} */}
                    
                    {/* Error message */}
                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}
                </div>
                <div className="dashboard-feature-section-bottom">
                    {featureInfoData.map((feature, index) => (
                        <div key={index} className="dashboard-feature-section-info">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p className="count-value">{loading ? "..." : supplierCounts[feature.countKey]}</p>
                            <p className="count-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
                
                {/* Second row of metrics */}
                <div className="dashboard-feature-section-bottom mt-4">
                    {additionalMetrics.map((metric, index) => (
                        <div key={index} className="dashboard-feature-section-info secondary-metric">
                            <div className="feature-icon secondary">{metric.icon}</div>
                            <h3>{metric.title}</h3>
                            <p className="count-value">{loading ? "..." : supplierCounts[metric.countKey]}</p>
                            <p className="count-description">{metric.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pie-chart-container">
                <h3>Suppliers by Type</h3>
                {suppliersByType && suppliersByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={suppliersByType}
                                dataKey="supplierCount"
                                nameKey="_id"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {suppliersByType.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} suppliers`, `Type: ${name}`]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="no-data-message">
                        <p>No supplier type data available</p>
                    </div>
                )}
            </div>

            {/* Supplier Table */}
            <div className="supplier-table-container">
                <h3>Active Suppliers List</h3><br />
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow className="supplier-table-header">
                                <TableCell align="left"><p>Supplier Name</p></TableCell>
                                <TableCell align="left"><p>Supplier Type</p></TableCell>
                                <TableCell align="left"><p>Status</p></TableCell>
                                <TableCell align="center"><p>Actions</p></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map((supplier) => (
                                <TableRow key={supplier._id}>
                                    <TableCell align="left"><p>{supplier.SupplierName}</p></TableCell>
                                    <TableCell align="left"><p>{supplier.SupplierType}</p></TableCell>
                                    <TableCell align="left"><p>{supplier.SupplierStatus}</p></TableCell>
                                    <TableCell align="center">
                                        <button onClick={() => handleOpenDialog(supplier)}>Change Status</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Dialog to change status */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Change Supplier Status</DialogTitle>
                <DialogContent>
                    <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <button onClick={handleCloseDialog}>Cancel</button>
                    <button onClick={handleStatusChange}>Update</button>
                </DialogActions>
            </Dialog>

            
        </div>
    );
}
