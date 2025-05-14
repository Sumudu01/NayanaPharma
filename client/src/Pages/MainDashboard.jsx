import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import Swal from "sweetalert2";
import axios from 'axios';

// Add a timeout to axios requests
axios.defaults.timeout = 5000; // 5 seconds timeout

const MainDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        customerCount: 0,
        salesCount: 0,
        stockCount: 0,
        productCount: 0,
        supplierCount: 0,
        deliveryCount: 0,
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [serverStatus, setServerStatus] = useState({
        userServer: false,
        mainServer: false
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");


                try {
                    const usersResponse = await axios.get("http://localhost:3000/api/user/");
                    setUsers(usersResponse.data || []);

                    console.log(usersResponse)

                    setDashboardData(prevData => ({
                        ...prevData,
                        customerCount: usersResponse.data?.length || 0
                    }));
                } catch (error) {
                    console.error("Error fetching users:", error);
                    // Don't set error message here, just log it
                }



                // Try to fetch sales count specifically with more detailed logging
                try {
                    const salesResponse = await axios.get("http://localhost:8070/sales/count");
                    console.log("Sales response:", salesResponse);
                    
                    setDashboardData(prevData => ({
                        ...prevData,
                        salesCount: salesResponse.data?.count || 0
                    }));
                } catch (salesError) {
                    console.error("Error fetching sales count:", salesError);
                    // Set a default value for development
                    setDashboardData(prevData => ({
                        ...prevData,
                        salesCount: 156 // Default demo value
                    }));
                }

                // Then continue with your other endpoints (excluding sales since we handled it separately)
                const endpoints = [
                    { url: "http://localhost:3000/supplier/counts", key: "supplierCount", dataKey: "totalSuppliers" },
                    { url: "http://localhost:3000/inventory/product-count", key: "productCount", dataKey: "count" },
                    { url: "http://localhost:3000/inventory/stock-count", key: "stockCount", dataKey: "count" },
                    { url: "http://localhost:3000/delivery/count", key: "deliveryCount", dataKey: "count" }
                ];

                const results = await Promise.allSettled(
                    endpoints.map(endpoint =>
                        axios.get(endpoint.url)
                            .then(response => ({
                                success: true,
                                endpoint,
                                data: response.data
                            }))
                            .catch(error => ({
                                success: false,
                                endpoint,
                                error
                            }))
                    )
                );


                results.forEach(result => {
                    if (result.status === 'fulfilled' && result.value.success) {
                        const { endpoint, data } = result.value;
                        setDashboardData(prevData => ({
                            ...prevData,
                            [endpoint.key]: data[endpoint.dataKey] || 0
                        }));
                    } else if (result.status === 'fulfilled') {
                        console.error(`Error fetching ${result.value.endpoint.key}:`, result.value.error);
                    }
                });

                setLoading(false)


            } catch (err) {
                console.error("Dashboard data fetch error:", err);
                setError("Failed to fetch dashboard data. Please check your connection or try again later.");
                setLoading(false);

                // Show a more user-friendly error message
                Swal.fire({
                    title: "Connection Error",
                    text: "Unable to connect to the backend servers. The application will display demo data.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });

                // Use demo data for development/testing
                setDashboardData({
                    customerCount: 42,
                    salesCount: 156,
                    stockCount: 789,
                    productCount: 124,
                    supplierCount: 18,
                    deliveryCount: 37
                });
            }
        };

        fetchDashboardData();
    }, []);

    // Function to check if servers are running
    const checkServerStatus = async () => {
        try {
            // Check user server
            try {
                await axios.get("http://localhost:5000/health", { timeout: 2000 });
                setServerStatus(prev => ({ ...prev, userServer: true }));
            } catch (error) {
                console.log("User server is not available");
                setServerStatus(prev => ({ ...prev, userServer: false }));
            }

            // Check main server
            try {
                await axios.get("http://localhost:8070/health", { timeout: 2000 });
                setServerStatus(prev => ({ ...prev, mainServer: true }));
            } catch (error) {
                console.log("Main server is not available");
                setServerStatus(prev => ({ ...prev, mainServer: false }));
            }
        } catch (error) {
            console.error("Error checking server status:", error);
        }
    };

    const handleViewCustomers = () => {
        navigate("/users");
    };

    const handleLogout = () => {
        localStorage.removeItem("admin");
        navigate("/");
    };

    return (
        <Container fluid className="dashboard-container" style={{ marginTop: "3%" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="dashboard-title m-0">Main Dashboard</h2>
                <Button
                    variant="outline-danger"
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Logout
                </Button>
            </div>

            {error && (
                <Alert variant="warning">
                    <Alert.Heading>Connection Issue</Alert.Heading>
                    <p>{error}</p>
                    <p className="mb-0">
                        <strong>Note:</strong> The dashboard is currently displaying demo data.
                    </p>
                </Alert>
            )}

            {/* Development Mode message - now hidden */}
            {/* {!serverStatus.userServer && !serverStatus.mainServer && !error && (
                <Alert variant="info">
                    <Alert.Heading>Development Mode</Alert.Heading>
                    <p>Backend servers are not detected. Displaying demo data for development purposes.</p>
                </Alert>
            )} */}

            <Row className="g-4">
                <Col md={6} lg={4}>
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <Card.Title className="card-title">
                                Total Customers
                            </Card.Title>
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </Spinner>
                            ) : (
                                <Card.Text className="card-count">
                                    {dashboardData.customerCount}
                                </Card.Text>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navigate("/customers")}
                                className="card-button"
                            >
                                View Customers
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={4}>
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <Card.Title className="card-title">
                                Total Sales and Billings
                            </Card.Title>
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </Spinner>
                            ) : (
                                <Card.Text className="card-count">
                                    {dashboardData.salesCount}
                                </Card.Text>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navigate("/Saleshome")}
                                className="card-button"
                            >
                                View Billings
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

<Col md={6} lg={4}>
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <Card.Title className="card-title">
                                Inventory Dashboard
                            </Card.Title>
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </Spinner>
                            ) : (
                                <Card.Text className="card-count">
                                    {dashboardData.productCount}
                                </Card.Text>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navigate("/inventory/productDashboard")}
                                className="card-button"
                            >
                                View Products
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4}>
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <Card.Title className="card-title">
                                Product Inventory
                            </Card.Title>
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </Spinner>
                            ) : (
                                <Card.Text className="card-count">
                                    {dashboardData.stockCount}
                                </Card.Text>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navigate("/inventory/list")}
                                className="card-button"
                            >
                                View Inventory
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={4}>
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <Card.Title className="card-title">
                                Total Suppliers
                            </Card.Title>
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </Spinner>
                            ) : (
                                <Card.Text className="card-count">
                                    {dashboardData.supplierCount}
                                </Card.Text>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navigate("/supDashboard")}
                                className="card-button"
                            >
                                View Supplier
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                

                <Col md={6} lg={4}>
                    <Card className="dashboard-card">
                        <Card.Body className="text-center">
                            <Card.Title className="card-title">
                                Total Delivery
                            </Card.Title>
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </Spinner>
                            ) : (
                                <Card.Text className="card-count">
                                    {dashboardData.deliveryCount}
                                </Card.Text>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => navigate("/deliveries")}
                                className="card-button"
                            >
                                View Delivery
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MainDashboard;
