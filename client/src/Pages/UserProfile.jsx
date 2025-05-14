import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Container,
    Spinner,
    Form,
    Row,
    Col,
    Badge,
    Alert,
    ProgressBar,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCreditCard,
    FiCalendar,
    FiEdit,
    FiDownload,
    FiArrowLeft,
    FiUser as FiAdmin,
} from "react-icons/fi";
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { FaPercentage, FaHistory, FaUserCog, FaPills } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import "./UserProfile.css";

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const profileRef = useRef();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [discountEnabled, setDiscountEnabled] = useState(false);
    const [adminName] = useState("Dr. Smith"); // This would normally come from auth context

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get(
                    `http://localhost:5000/api/users/${id}`
                );
                setUser(userResponse.data.user);
                setDiscountEnabled(
                    userResponse.data.user.discountEnabled || false
                );
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to fetch user data",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };
        fetchUserData();
    }, [id]);

    const handleToggleDiscount = async () => {
        try {
            const newDiscountStatus = !discountEnabled;
            await axios.put(`http://localhost:5000/api/users/${id}/discount`, {
                discountEnabled: newDiscountStatus,
            });
            setDiscountEnabled(newDiscountStatus);
            Swal.fire({
                title: "Success!",
                text: `Discount ${newDiscountStatus ? "enabled" : "disabled"}`,
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (err) {
            Swal.fire({
                title: "Error!",
                text:
                    err.response?.data?.message ||
                    "Failed to update discount status",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const generatePDF = () => {
        const pdfContent = document.createElement("div");
        pdfContent.style.position = "absolute";
        pdfContent.style.left = "-9999px";
        pdfContent.style.width = "210mm";
        pdfContent.style.padding = "20px";
        pdfContent.style.backgroundColor = "white";

        const card = profileRef.current.cloneNode(true);
        const elementsToRemove = card.querySelectorAll(
            "button, .btn, .form-check, .d-flex.justify-content-between"
        );
        elementsToRemove.forEach((element) => element.remove());

        const title = document.createElement("h2");
        title.textContent = `Pharmacy User Profile: ${user.firstName} ${user.lastName}`;
        title.style.textAlign = "center";
        title.style.marginBottom = "20px";
        title.style.color = "var(--primary)";
        pdfContent.appendChild(title);

        pdfContent.appendChild(card);
        document.body.appendChild(pdfContent);

        html2canvas(pdfContent, {
            scale: 2,
            logging: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: pdfContent.scrollWidth,
            windowHeight: pdfContent.scrollHeight,
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
            pdf.save(`${user.firstName}_${user.lastName}_profile.pdf`);
            document.body.removeChild(pdfContent);
        });
    };

    const getGenderIcon = () => {
        if (user.gender.toLowerCase() === "male") {
            return <IoMdMale className="text-primary" />;
        } else if (user.gender.toLowerCase() === "female") {
            return <IoMdFemale className="text-danger" />;
        }
        return <FiUser className="text-secondary" />;
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Spinner animation="border" className="text-custom-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Error Loading User Data</Alert.Heading>
                    <p>{error}</p>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/users")}
                        className="mt-3"
                    >
                        <FiArrowLeft className="me-2" />
                        Back to Users
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5">
                <Alert variant="warning" className="text-center">
                    <Alert.Heading>User Not Found</Alert.Heading>
                    <p>The requested user could not be found in the system.</p>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/users")}
                        className="mt-3"
                    >
                        <FiArrowLeft className="me-2" />
                        Back to Users
                    </Button>
                </Alert>
            </Container>
        );
    }

    // Register ChartJS components
    ChartJS.register(ArcElement, Tooltip, Legend);

    const pieChartData = {
        labels: ["Panadols", "Vitamin C", "Other"],
        datasets: [
            {
                data: [35, 20, 5],
                backgroundColor: [
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                ],
                borderColor: [
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 10,
                    },
                    usePointStyle: true,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce(
                            (acc, data) => acc + data,
                            0
                        );
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
        cutout: "65%",
    };

    return (
        <Container className="user-profile-container" ref={profileRef}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button
                    className="btn-export-pdf d-flex align-items-center"
                    onClick={generatePDF}
                >
                    <FiDownload className="me-2" />
                    Export as PDF
                </Button>
            </div>

            <Card className="profile-card">
                <Card.Header className="profile-header">
                    <div>
                        <h3 className="mb-0">
                            <Button
                                variant="link"
                                onClick={() => navigate("/users")}
                                className="p-0 me-2 text-white"
                            >
                                <FiArrowLeft size={24} />
                            </Button>
                            <FiUser className="me-2" />
                            {user.firstName} {user.lastName}'s Profile
                        </h3>
                    </div>

                    <span className="account-status-badge">Active Account</span>
                </Card.Header>

                <Card.Body className="bg-custom-light p-4">
                    <Row>
                        <Col md={6} className="mb-4">
                            <Card className="profile-card h-100">
                                <Card.Header>
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <FiUser className="me-2" />
                                        Personal Details
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <FiUser />
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    Full Name
                                                </div>
                                                <div className="detail-value">
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <FiCalendar />
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    Age
                                                </div>
                                                <div className="detail-value">
                                                    {user.age}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <FiMail />
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    Email
                                                </div>
                                                <div className="detail-value">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <FiPhone />
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    Contact Number
                                                </div>
                                                <div className="detail-value">
                                                    {user.contactNumber}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <FiCreditCard />
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    NIC
                                                </div>
                                                <div className="detail-value">
                                                    {user.nic}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                {getGenderIcon()}
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    Gender
                                                </div>
                                                <div className="detail-value">
                                                    {user.gender}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-4">
                            <Card className="profile-card h-100">
                                <Card.Header>
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <FaUserCog className="me-2" />
                                        Account Management
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {/* Enhanced Discount Program Section */}
                                    <div
                                        className={`discount-section p-3 rounded ${
                                            discountEnabled
                                                ? "bg-success-light border border-success"
                                                : "bg-danger-light border border-danger"
                                        }`}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className={`discount-icon me-3 ${
                                                        discountEnabled
                                                            ? "text-success"
                                                            : "text-danger"
                                                    }`}
                                                >
                                                    <FaPercentage size={24} />
                                                </div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold">
                                                        Discount Program
                                                    </h6>
                                                    <p
                                                        className={`mb-0 small ${
                                                            discountEnabled
                                                                ? "text-success"
                                                                : "text-danger"
                                                        }`}
                                                    >
                                                        {discountEnabled
                                                            ? "15% discount applied to all purchases"
                                                            : "Discount program currently inactive"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span
                                                    className={`badge rounded-pill me-3 ${
                                                        discountEnabled
                                                            ? "bg-success"
                                                            : "bg-danger"
                                                    }`}
                                                >
                                                    {discountEnabled
                                                        ? "ACTIVE"
                                                        : "INACTIVE"}
                                                </span>
                                                <Form.Check
                                                    type="switch"
                                                    id="discount-switch"
                                                    checked={discountEnabled}
                                                    onChange={
                                                        handleToggleDiscount
                                                    }
                                                    className={`discount-switch ${
                                                        discountEnabled
                                                            ? "success-switch"
                                                            : "danger-switch"
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {discountEnabled && (
                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="text-muted small">
                                                        Discount Status
                                                    </span>
                                                    <span className="text-success fw-bold">
                                                        15% Applied
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    now={100}
                                                    variant="success"
                                                    className="mb-2"
                                                    style={{
                                                        height: "6px",
                                                    }}
                                                />
                                                <div className="d-flex align-items-center text-success small">
                                                    <BsCheckCircleFill className="me-2" />
                                                    <span>
                                                        Discount benefits are
                                                        currently active for
                                                        this account
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Purchase Distribution Pie Chart */}
                                    <div className="mt-4">
                                        <h6 className="mb-3 d-flex align-items-center">
                                            <FaPills className="me-2 text-muted" />
                                            <span className="fw-bold">
                                                Purchase Distribution
                                            </span>
                                        </h6>
                                        <div
                                            className="chart-container"
                                            style={{
                                                height: "220px",
                                                position: "relative",
                                            }}
                                        >
                                            <Pie
                                                data={pieChartData}
                                                options={pieChartOptions}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <small className="text-muted fst-italic">
                                                By medication category
                                            </small>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 text-decoration-none"
                                                onClick={() => {
                                                    /* Add handler to view full breakdown */
                                                }}
                                            >
                                                View details &rarr;
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Enhanced Account Management Buttons */}
                                    <div className="row mt-4 g-3">
                                        <div className="col-md-6">
                                            <div
                                                className="account-btn btn-edit-profile p-3 rounded d-flex align-items-center"
                                                onClick={() =>
                                                    navigate(
                                                        `/users/${id}/edit`
                                                    )
                                                }
                                            >
                                                <div className="btn-icon me-3">
                                                    <FiEdit
                                                        size={24}
                                                        className="text-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-primary">
                                                        Edit Profile
                                                    </h6>
                                                    <p className="mb-0 small text-muted">
                                                        Update personal
                                                        information and settings
                                                    </p>
                                                </div>
                                                <div className="ms-auto">
                                                    <span className="text-muted">
                                                        &rarr;
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div
                                                className="account-btn btn-view-activity p-3 rounded d-flex align-items-center"
                                                onClick={() => {
                                                    /* Add view activity handler */
                                                }}
                                            >
                                                <div className="btn-icon me-3">
                                                    <FaHistory
                                                        size={24}
                                                        className="text-info"
                                                    />
                                                </div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-info">
                                                        View Activity
                                                    </h6>
                                                    <p className="mb-0 small text-muted">
                                                        Check recent account
                                                        activity and logs
                                                    </p>
                                                </div>
                                                <div className="ms-auto">
                                                    <span className="text-muted">
                                                        &rarr;
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12} className="mb-4">
                            <Card className="profile-card">
                                <Card.Header>
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <FaHistory className="me-2" />
                                        Purchase History
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="text-center py-4">
                                        <div
                                            className="user-avatar mx-auto mb-3"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                            }}
                                        >
                                            <FaHistory size={24} />
                                        </div>
                                        <h5 className="mb-2">
                                            Purchase Records
                                        </h5>
                                        <p className="text-muted small mb-4">
                                            View complete transaction history
                                            and medication purchases
                                        </p>
                                        <Button className="btn-purchase-history">
                                            View Full History
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>

                <Card.Footer className="profile-footer">
                    <div className="admin-name">
                        <FiAdmin />
                        {adminName}
                    </div>
                    <div>
                        <span>Account created:</span>{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default UserProfile;
