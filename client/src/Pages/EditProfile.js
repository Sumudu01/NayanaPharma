import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
    Form,
    Button,
    Card,
    Row,
    Col,
    Container,
    Spinner,
    Modal,
    Badge,
    Alert,
    InputGroup
} from "react-bootstrap";
import {
    FiTrash2,
    FiArrowLeft,
    FiUser,
    FiCalendar,
    FiMail,
    FiPhone,
    FiCreditCard,
    FiSave
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const EditProfile = () => {
    // Color scheme matching UserRegister
    const colors = {
        primary: "#2c3e50",       // Dark blue-gray
        secondary: "#f9a825",     // Gold/yellow
        light: "#f8f9fa",         // Light background
        dark: "#343a40",          // Dark text
        border: "#dee2e6",        // Border color
        success: "#28a745",       // Success green
        danger: "#dc3545"         // Danger red
    };

    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        nic: "",
        dob: null,
        age: 0,
        gender: "",
        contactNumber: "",
        email: "",
        discountStatus: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get(
                    `http://localhost:5000/api/users/${id}`
                );
                const user = userResponse.data.user;

                setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    nic: user.nic,
                    dob: user.dob ? new Date(user.dob) : null,
                    age: user.age,
                    gender: user.gender,
                    contactNumber: user.contactNumber,
                    email: user.email,
                    discountStatus: user.discountStatus || false,
                });
                setLoading(false);
            } catch (err) {
                showAlert("Error!", "Failed to fetch user data", "error");
                navigate("/users");
            }
        };
        fetchUserData();
    }, [id, navigate]);

    useEffect(() => {
        if (formData.dob) {
            const today = new Date();
            const birthDate = new Date(formData.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }
            setFormData((prev) => ({ ...prev, age }));
        }
    }, [formData.dob]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, dob: date }));
    };

    const validateForm = () => {
        const newErrors = {};
        const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
        const phoneRegex = /^[0-9]{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.firstName.trim())
            newErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
            newErrors.lastName = "Last name is required";
        if (!formData.nic.trim()) {
            newErrors.nic = "NIC is required";
        } else if (!nicRegex.test(formData.nic)) {
            newErrors.nic = "Invalid NIC format (Use 123456789V or 123456789012)";
        }
        if (!formData.dob) newErrors.dob = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = "Contact number is required";
        } else if (!phoneRegex.test(formData.contactNumber)) {
            newErrors.contactNumber =
                "Invalid phone number (10 digits required)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showAlert("Validation Error", "Please correct the highlighted fields", "warning");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/users/${id}`, {
                ...formData,
                dob: formData.dob.toISOString(),
            });

            showAlert("Success!", "Profile updated successfully", "success");
            navigate(`/users/${id}`);
        } catch (error) {
            showAlert("Error!", error.response?.data?.message || "Update failed", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/users/${id}`);
            showAlert("Success!", "User deleted successfully", "success");
            navigate("/users");
        } catch (error) {
            showAlert("Error!", error.response?.data?.message || "Delete failed", "error");
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleDiscountToggle = async () => {
        try {
            const newStatus = !formData.discountStatus;
            await axios.patch(
                `http://localhost:5000/api/users/${id}/discount`,
                {
                    discountStatus: newStatus,
                }
            );
            setFormData((prev) => ({ ...prev, discountStatus: newStatus }));
            showAlert("Success!", `Discount ${newStatus ? "enabled" : "disabled"}`, "success");
        } catch (error) {
            showAlert("Error!", error.response?.data?.message || "Failed to update discount status", "error");
        }
    };

    const showAlert = (title, text, icon) => {
        Swal.fire({
            title,
            text,
            icon,
            background: colors.light,
            confirmButtonColor: colors.primary,
            iconColor: icon === "success" ? colors.success : 
                    icon === "error" ? colors.danger : colors.secondary
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center py-4" 
            style={{ 
                minHeight: "100vh",
                backgroundColor: colors.light 
            }}>
            <Card className="shadow-lg" style={{ 
                width: "850px",
                borderColor: colors.border
            }}>
                <Card.Header className="py-3" style={{ 
                    backgroundColor: colors.primary,
                    borderBottom: `3px solid ${colors.secondary}`
                }}>
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="link" 
                            onClick={() => navigate(`/users/${id}`)}
                            className="p-0 me-2 text-white"
                        >
                            <FiArrowLeft size={24} />
                        </Button>
                        <h4 className="mb-0 text-white">
                            EDIT USER PROFILE
                        </h4>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">First Name</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.firstName}
                                            style={{ 
                                                borderColor: errors.firstName ? colors.danger : colors.border
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Last Name</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.lastName}
                                            style={{ 
                                                borderColor: errors.lastName ? colors.danger : colors.border
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">NIC Number</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiCreditCard />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="nic"
                                            value={formData.nic}
                                            onChange={handleChange}
                                            isInvalid={!!errors.nic}
                                            style={{ 
                                                borderColor: errors.nic ? colors.danger : colors.border
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.nic}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Email Address</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiMail />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            isInvalid={!!errors.email}
                                            style={{ 
                                                borderColor: errors.email ? colors.danger : colors.border
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Contact Number</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiPhone />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            isInvalid={!!errors.contactNumber}
                                            style={{ 
                                                borderColor: errors.contactNumber ? colors.danger : colors.border
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.contactNumber}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Gender</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            isInvalid={!!errors.gender}
                                            style={{ 
                                                borderColor: errors.gender ? colors.danger : colors.border
                                            }}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.gender}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiCalendar />
                                        </InputGroup.Text>
                                        <DatePicker
                                            selected={formData.dob}
                                            onChange={handleDateChange}
                                            className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                                            dateFormat="yyyy-MM-dd"
                                            maxDate={new Date()}
                                            showYearDropdown
                                            dropdownMode="select"
                                            style={{ 
                                                borderColor: errors.dob ? colors.danger : colors.border,
                                                width: "100%"
                                            }}
                                        />
                                        {errors.dob && (
                                            <div className="invalid-feedback d-block">
                                                {errors.dob}
                                            </div>
                                        )}
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Age</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ 
                                            backgroundColor: colors.secondary,
                                            color: colors.primary
                                        }}>
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            value={
                                                formData.age
                                                    ? `${formData.age} years`
                                                    : ""
                                            }
                                            readOnly
                                            className="bg-light"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Discount Status</Form.Label>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="form-check form-switch mb-0">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="discountSwitch"
                                                checked={formData.discountStatus}
                                                onChange={handleDiscountToggle}
                                                style={{
                                                    width: "3em",
                                                    height: "1.5em",
                                                    backgroundColor: formData.discountStatus ? colors.secondary : "#adb5bd",
                                                    borderColor: formData.discountStatus ? colors.secondary : "#adb5bd"
                                                }}
                                            />
                                        </div>
                                        <Badge
                                            pill
                                            style={{
                                                backgroundColor: formData.discountStatus ? colors.secondary : colors.border,
                                                color: formData.discountStatus ? colors.primary : colors.dark
                                            }}
                                            className="px-3 py-2"
                                        >
                                            {formData.discountStatus
                                                ? "Active (10% Discount)"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between border-top pt-4">
                            <Button
                                variant="outline-danger"
                                onClick={() => setShowDeleteModal(true)}
                                className="d-flex align-items-center gap-2"
                                style={{
                                    borderColor: colors.danger,
                                    color: colors.danger
                                }}
                            >
                                <FiTrash2 size={18} />
                                Delete Account
                            </Button>
                            <div className="d-flex gap-3">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate(-1)}
                                    style={{
                                        borderColor: colors.border,
                                        color: colors.dark
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="px-4 d-flex align-items-center gap-2"
                                    style={{ 
                                        backgroundColor: colors.primary,
                                        borderColor: colors.primary
                                    }}
                                >
                                    <FiSave size={18} />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="h5">Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger" className="border-0" style={{ 
                        backgroundColor: `${colors.danger}10`,
                        borderLeft: `4px solid ${colors.danger}`
                    }}>
                        <div className="d-flex gap-3">
                            <div style={{ color: colors.danger }}>
                                <FiTrash2 size={24} />
                            </div>
                            <div>
                                <h6 className="alert-heading mb-2">Delete User Account</h6>
                                <p className="mb-0 small">
                                    This action will permanently delete this user and all associated data.
                                    This cannot be undone.
                                </p>
                            </div>
                        </div>
                    </Alert>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="light"
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4"
                        style={{
                            borderColor: colors.border,
                            color: colors.dark
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        className="px-4"
                        style={{ 
                            backgroundColor: colors.danger,
                            borderColor: colors.danger
                        }}
                    >
                        Delete Permanently
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default EditProfile;