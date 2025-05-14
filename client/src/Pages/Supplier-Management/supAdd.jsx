import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./supNav.jsx";
import "./sup_add.css";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SupplierAdd() {
    const [formData, setFormData] = useState({
        SupplierName: "",
        SupplierContact: "",
        SupplierEmail: "",
        SupplierAddress: "",
        SupplierType: "",
        SupplierStatus: "Active",
        SupplierContractStartDate: "",
        SupplierContractEndDate: "",
        SupplierTotalOrders: 0,
        SupplierProducts: "",
        performanceMetrics: {
            communication: 3,
            quality: 3,
            averageDeliveryTime: "",
            onTimeDeliveryRate: "",
            lastUpdated: ""
        }
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [suppliersByType, setSuppliersByType] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);

    // Colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    useEffect(() => {
        // Fetch supplier data for the chart when component mounts
        fetchSuppliersByType();
    }, []);

    const fetchSuppliersByType = async () => {
        setChartLoading(true);
        try {
            const response = await axios.get("http://localhost:3000/supplier/suppliers-by-type");
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSuppliersByType(response.data);
            } else {
                // Sample data if API returns empty
                const sampleData = [
                    { _id: "Medicine", supplierCount: 5 },
                    { _id: "Medicine Equipments", supplierCount: 3 },
                    { _id: "Equipments", supplierCount: 2 },
                    { _id: "Nutritional supplies", supplierCount: 4 },
                    { _id: "Physician office supplies", supplierCount: 1 }
                ];
                setSuppliersByType(sampleData);
            }
        } catch (error) {
            console.error("Error fetching suppliers by type:", error);
            // Set sample data on error
            const sampleData = [
                { _id: "Medicine", supplierCount: 5 },
                { _id: "Medicine Equipments", supplierCount: 3 },
                { _id: "Equipments", supplierCount: 2 },
                { _id: "Nutritional supplies", supplierCount: 4 },
                { _id: "Physician office supplies", supplierCount: 1 }
            ];
            setSuppliersByType(sampleData);
        } finally {
            setChartLoading(false);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
    
        if (!formData.SupplierName) newErrors.SupplierName = "Supplier Name is required";
        if (!phoneRegex.test(formData.SupplierContact)) newErrors.SupplierContact = "Invalid contact number (10 digits required)";
        if (!emailRegex.test(formData.SupplierEmail)) newErrors.SupplierEmail = "Invalid email format";
        if (!formData.SupplierAddress) newErrors.SupplierAddress = "Supplier Address is required";
        if (!formData.SupplierType) newErrors.SupplierType = "Supplier Type is required";
        if (!formData.SupplierContractStartDate) newErrors.SupplierContractStartDate = "Start date is required";
        if (!formData.SupplierContractEndDate) newErrors.SupplierContractEndDate = "End date is required";
        if (formData.SupplierContractEndDate < formData.SupplierContractStartDate) newErrors.SupplierContractEndDate = "End date cannot be before start date";
        if (!formData.SupplierProducts) newErrors.SupplierProducts = "Supplier Products are required";
    
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            window.alert(firstError);
            return false;
        }
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name in formData.performanceMetrics) {
            setFormData({
                ...formData,
                performanceMetrics: {
                    ...formData.performanceMetrics,
                    [name]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:3000/supplier/add", formData);
            window.alert(response.data.message);
            setFormData({
                SupplierName: "",
                SupplierContact: "",
                SupplierEmail: "",
                SupplierAddress: "",
                SupplierType: "",
                SupplierStatus: "Active",
                SupplierContractStartDate: "",
                SupplierContractEndDate: "",
                SupplierTotalOrders: 0,
                SupplierProducts: "",
                performanceMetrics: {
                    communication: 3,
                    quality: 3,
                    averageDeliveryTime: "",
                    onTimeDeliveryRate: "",
                    lastUpdated: ""
                }
            });
            // Redirect to all suppliers page after successful addition
            window.location.href = "/supAll";
        } catch (err) {
            window.alert("Error: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="supplier-add-page">
            <div className="supplier-content-wrapper">
                <div className="container">
                    <h2 className="form-heading">Add a New Supplier</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <label>Supplier Name:</label>
                            <input type="text" name="SupplierName" value={formData.SupplierName} onChange={handleInputChange} className={errors.SupplierName ? "error" : ""} />
                            {errors.SupplierName && <div className="error-message">{errors.SupplierName}</div>}
                            
                            <label>Supplier Contact:</label>
                            <input type="text" name="SupplierContact" value={formData.SupplierContact} onChange={handleInputChange} className={errors.SupplierContact ? "error" : ""} />
                            {errors.SupplierContact && <div className="error-message">{errors.SupplierContact}</div>}
                            
                            <label>Supplier Email:</label>
                            <input type="email" name="SupplierEmail" value={formData.SupplierEmail} onChange={handleInputChange} className={errors.SupplierEmail ? "error" : ""} />
                            {errors.SupplierEmail && <div className="error-message">{errors.SupplierEmail}</div>}
                            
                            <label>Supplier Address:</label>
                            <input type="text" name="SupplierAddress" value={formData.SupplierAddress} onChange={handleInputChange} className={errors.SupplierAddress ? "error" : ""} />
                            {errors.SupplierAddress && <div className="error-message">{errors.SupplierAddress}</div>}
                        </div>
                        
                        <div className="form-section">
                            <label>Supplier Type:</label>
                            <select name="SupplierType" value={formData.SupplierType} onChange={handleInputChange} className={errors.SupplierType ? "error" : ""}>
                                <option value="">Select Type</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Medicine Equipments">Medicine Equipments</option>
                                <option value="Equipments">Equipments</option>
                                <option value="Nutritional supplies">Nutritional supplies</option>
                                <option value="Physician office supplies">Physician office supplies</option>
                            </select>
                            {errors.SupplierType && <div className="error-message">{errors.SupplierType}</div>}
                            
                            <label>Contract Start Date:</label>
                            <input type="date" name="SupplierContractStartDate" value={formData.SupplierContractStartDate} onChange={handleInputChange} className={errors.SupplierContractStartDate ? "error" : ""} />
                            {errors.SupplierContractStartDate && <div className="error-message">{errors.SupplierContractStartDate}</div>}
                            
                            <label>Contract End Date:</label>
                            <input type="date" name="SupplierContractEndDate" value={formData.SupplierContractEndDate} onChange={handleInputChange} className={errors.SupplierContractEndDate ? "error" : ""} />
                            {errors.SupplierContractEndDate && <div className="error-message">{errors.SupplierContractEndDate}</div>}
                            
                            <label>Supplier Products:</label>
                            <input type="text" name="SupplierProducts" value={formData.SupplierProducts} onChange={handleInputChange} className={errors.SupplierProducts ? "error" : ""} />
                            {errors.SupplierProducts && <div className="error-message">{errors.SupplierProducts}</div>}
                        </div>
                        
                        <div className="form-section performance-metrics">
                            <h3>Performance Metrics</h3>
                            <label>Communication (1-5):</label>
                            <input type="number" name="communication" min="1" max="5" value={formData.performanceMetrics.communication} onChange={handleInputChange} />
                            
                            <label>Quality (1-5):</label>
                            <input type="number" name="quality" min="1" max="5" value={formData.performanceMetrics.quality} onChange={handleInputChange} />
                            
                            <label>Average Delivery Time (days):</label>
                            <input type="number" name="averageDeliveryTime" value={formData.performanceMetrics.averageDeliveryTime} onChange={handleInputChange} />
                            
                            <label>On-Time Delivery Rate (%):</label>
                            <input type="number" name="onTimeDeliveryRate" value={formData.performanceMetrics.onTimeDeliveryRate} onChange={handleInputChange} />
                        </div>
                        
                        <button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Adding Supplier...
                                </>
                            ) : "Add Supplier"}
                        </button>
                    </form>
                </div>

                {/* Chart section */}
                <div className="chart-container">
                    <h3 className="chart-title">Supplier Distribution by Type</h3>
                    {chartLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                            <span className="spinner-border" role="status" aria-hidden="true"></span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={suppliersByType}
                                    dataKey="supplierCount"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {suppliersByType.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} suppliers`]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <div className="chart-explanation">
                        <h4>Chart Analysis</h4>
                        <p>This chart shows the distribution of suppliers by their type. Understanding this distribution helps in identifying which supplier categories may need more partners or which ones are already well-represented.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
