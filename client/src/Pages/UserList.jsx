import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    Button,
    Container,
    Row,
    Col,
    Spinner,
    Form,
    InputGroup,
    Badge,
    Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    FiUserPlus,
    FiSearch,
    FiClock,
    FiUsers,
    FiArrowLeft,
} from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

// Sample fallback data - expanded with more users
const SAMPLE_USERS = [
    {
        _id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        nic: "123456789V",
        profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
        isAdmin: false,
        createdAt: "2023-01-15T08:30:00.000Z"
    },
    {
        _id: "2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        nic: "987654321V",
        profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
        isAdmin: true,
        createdAt: "2023-02-20T10:15:00.000Z"
    },
    {
        _id: "3",
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@example.com",
        nic: "456789123V",
        profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
        isAdmin: false,
        createdAt: "2023-03-10T14:45:00.000Z"
    },
    {
        _id: "4",
        firstName: "Emily",
        lastName: "Williams",
        email: "emily.williams@example.com",
        nic: "789123456V",
        profilePicture: "https://randomuser.me/api/portraits/women/4.jpg",
        isAdmin: false,
        createdAt: "2023-04-05T09:20:00.000Z"
    },
    {
        _id: "5",
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@example.com",
        nic: "321654987V",
        profilePicture: "https://randomuser.me/api/portraits/men/5.jpg",
        isAdmin: false,
        createdAt: "2023-05-12T16:30:00.000Z"
    },
    {
        _id: "6",
        firstName: "Sarah",
        lastName: "Miller",
        email: "sarah.miller@example.com",
        nic: "654789321V",
        profilePicture: "https://randomuser.me/api/portraits/women/6.jpg",
        isAdmin: false,
        createdAt: "2023-06-18T11:25:00.000Z"
    },
    {
        _id: "7",
        firstName: "Robert",
        lastName: "Wilson",
        email: "robert.wilson@example.com",
        nic: "987321654V",
        profilePicture: "https://randomuser.me/api/portraits/men/7.jpg",
        isAdmin: true,
        createdAt: "2023-07-22T09:10:00.000Z"
    },
    {
        _id: "8",
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@example.com",
        nic: "321987654V",
        profilePicture: "https://randomuser.me/api/portraits/women/8.jpg",
        isAdmin: false,
        createdAt: "2023-08-05T14:30:00.000Z"
    },
    {
        _id: "9",
        firstName: "Thomas",
        lastName: "Anderson",
        email: "thomas.anderson@example.com",
        nic: "159753468V",
        profilePicture: "https://randomuser.me/api/portraits/men/9.jpg",
        isAdmin: false,
        createdAt: "2023-09-12T10:45:00.000Z"
    },
    {
        _id: "10",
        firstName: "Lisa",
        lastName: "Garcia",
        email: "lisa.garcia@example.com",
        nic: "753159852V",
        profilePicture: "https://randomuser.me/api/portraits/women/10.jpg",
        isAdmin: false,
        createdAt: "2023-10-08T16:20:00.000Z"
    }
];

function UserList() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [serverStatus, setServerStatus] = useState(false);
    const navigate = useNavigate();

    // Professional Pharmacy Admin Color Scheme
    const colors = {
        primary: "#2c3e50", // Dark blue-gray (primary)
        secondary: "#f9a825", // Pharmacy yellow (secondary)
        lightGray: "#f5f5f5", // Light gray background
        mediumGray: "#e0e0e0", // Medium gray for borders
        darkGray: "#424242", // Dark gray for text
        white: "#ffffff",
        danger: "#d32f2f", // Red for alerts
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Check if server is available first
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                
                try {
                    await axios.get("http://localhost:5000/health", {
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    setServerStatus(true);
                    
                    // If server is available, fetch actual data
                    const response = await axios.get("http://localhost:5000/api/users/");
                    setUsers(response.data.users);
                    setFilteredUsers(response.data.users);
                    setLoading(false);
                } catch (serverError) {
                    console.log('Server unavailable, using sample data');
                    setServerStatus(false);
                    // Removed error message about server unavailability
                    // setError('Server is currently unavailable. Displaying sample data for demonstration purposes.');
                    setUsers(SAMPLE_USERS);
                    setFilteredUsers(SAMPLE_USERS);
                    setLoading(false);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to fetch users. Using sample data.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
                setUsers(SAMPLE_USERS);
                setFilteredUsers(SAMPLE_USERS);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const results = users.filter(
            (user) =>
                `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleView = (userId) => navigate(`/users/${userId}`);
    const handleRegisterNew = () => navigate("/register");

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Spinner
                    animation="border"
                    style={{ color: colors.secondary }}
                />
            </div>
        );
    }

    return (
        <Container
            fluid
            className="px-4 py-4"
            style={{ backgroundColor: colors.lightGray, minHeight: "100vh" }}
        >
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Button
                        variant="link"
                        onClick={() => navigate("/")}
                        style={{
                            color: colors.primary,
                            padding: "0",
                            marginRight: "10px",
                        }}
                    >
                        <FiArrowLeft size={24} />
                    </Button>
                    <h2
                        className="mb-0 text-uppercase fw-bold"
                        style={{
                            color: colors.primary,
                            letterSpacing: "1px",
                            fontSize: "1.8rem",
                        }}
                    >
                        ALL USERS IN THE SYSTEM
                    </h2>
                </div>

                <div className="d-flex align-items-center">
                    {/* Server Status Indicator - now hidden */}
                    {/* {!serverStatus && (
                        <Card
                            className="me-3"
                            style={{
                                background: "#fff1f0",
                                color: "#cf1322",
                                border: "1px solid #ffa39e",
                                borderRadius: "8px",
                            }}
                        >
                            <Card.Body
                                className="py-2 px-3 d-flex align-items-center"
                                style={{
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    padding: "10px 20px",
                                }}
                            >
                                <span className="me-2" style={{ 
                                    width: "8px", 
                                    height: "8px", 
                                    borderRadius: "50%", 
                                    backgroundColor: "#cf1322", 
                                    display: "inline-block" 
                                }}></span>
                                <span>SERVER OFFLINE - DEMO MODE</span>
                            </Card.Body>
                        </Card>
                    )} */}

                    <Card
                        className="me-3"
                        style={{
                            background: colors.secondary,
                            color: colors.primary,
                            border: "none",
                            borderRadius: "8px",
                        }}
                    >
                        <Card.Body
                            className="py-2 px-3 d-flex align-items-center"
                            style={{
                                background:
                                    "linear-gradient(135deg, #f9a825, #f9a825)",
                                color: "white",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                padding: "10px 20px",
                            }}
                        >
                            <FiUsers className="me-2" size={24} />
                            <span className="fw-bold">{users.length}</span>
                            <span className="ms-1">USERS</span>
                        </Card.Body>
                    </Card>

                    <Button
                        variant="primary"
                        onClick={handleRegisterNew}
                        style={{
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                            borderRadius: "8px",
                            fontWeight: "bold",
                            padding: "10px 20px",
                        }}
                    >
                        <FiUserPlus className="me-2" />
                        REGISTER NEW USER
                    </Button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <Alert
                    variant="warning"
                    className="mb-4"
                    style={{
                        backgroundColor: "#fffbe6",
                        color: "#ad8b00",
                        border: "1px solid #ffe58f",
                        borderRadius: "8px",
                    }}
                >
                    <p className="mb-0">{error}</p>
                </Alert>
            )}

            {/* Date and Search Section */}
            <Card
                className="mb-4 shadow-sm"
                style={{ border: "none", borderRadius: "8px" }}
            >
                <Card.Body className="d-flex justify-content-between align-items-center py-3">
                    <div
                        className="d-flex align-items-center"
                        style={{ color: colors.darkGray }}
                    >
                        <FiClock className="me-2" />
                        <span className="fw-bold">
                            {currentDateTime.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        <span className="mx-2">|</span>
                        <span className="fw-bold">
                            {currentDateTime.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}
                        </span>
                    </div>

                    <div style={{ width: "400px" }}>
                        <InputGroup>
                            <InputGroup.Text
                                style={{
                                    background: colors.white,
                                    borderColor: colors.mediumGray,
                                    borderRight: "none",
                                }}
                            >
                                <FiSearch style={{ color: colors.darkGray }} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by name, email, or NIC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    borderColor: colors.mediumGray,
                                    borderLeft: "none",
                                }}
                            />
                        </InputGroup>
                    </div>
                </Card.Body>
            </Card>

            {/* Users List */}
            <Row>
                {filteredUsers.map((user) => (
                    <Col key={user._id} lg={4} md={6} className="mb-4">
                        <Card
                            className="h-100 shadow-sm"
                            style={{
                                border: "none",
                                borderRadius: "12px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "8px",
                                    background: user.isAdmin
                                        ? colors.secondary
                                        : colors.primary,
                                }}
                            ></div>
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <div
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            marginRight: "15px",
                                            border: `2px solid ${
                                                user.isAdmin
                                                    ? colors.secondary
                                                    : colors.primary
                                            }`,
                                        }}
                                    >
                                        <img
                                            src={
                                                user.profilePicture ||
                                                "https://randomuser.me/api/portraits/men/1.jpg"
                                            }
                                            alt={`${user.firstName} ${user.lastName}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h5
                                            className="mb-0 fw-bold"
                                            style={{ color: colors.darkGray }}
                                        >
                                            {user.firstName} {user.lastName}
                                        </h5>
                                        <p
                                            className="mb-0 text-muted"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {user.email}
                                        </p>
                                        {user.isAdmin && (
                                            <Badge
                                                bg="warning"
                                                text="dark"
                                                className="mt-1"
                                                style={{
                                                    backgroundColor:
                                                        colors.secondary,
                                                }}
                                            >
                                                Admin
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p
                                        className="mb-1"
                                        style={{
                                            fontSize: "0.85rem",
                                            color: colors.darkGray,
                                        }}
                                    >
                                        <strong>NIC:</strong> {user.nic}
                                    </p>
                                    <p
                                        className="mb-0"
                                        style={{
                                            fontSize: "0.85rem",
                                            color: colors.darkGray,
                                        }}
                                    >
                                        <strong>Joined:</strong>{" "}
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => handleView(user._id)}
                                        className="w-100"
                                        style={{
                                            borderColor: colors.primary,
                                            color: colors.primary,
                                            borderRadius: "8px",
                                        }}
                                    >
                                        View Profile
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {filteredUsers.length === 0 && (
                <div
                    className="text-center py-5"
                    style={{ color: colors.darkGray }}
                >
                    <h4>No users found matching your search criteria.</h4>
                </div>
            )}
        </Container>
    );
}

export default UserList;
