import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Form,
    Button,
    Card,
    Row,
    Col,
    Container,
    InputGroup,
    Spinner,
} from "react-bootstrap";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiCreditCard,
    FiArrowLeft,
    FiSave,
    FiUserCheck,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const UserRegister = () => {
        const navigate = useNavigate();
    // Color scheme
    const colors = {
        primary: "#2c3e50", // Dark blue-gray
        secondary: "#f9a825", // Gold/yellow
        light: "#f8f9fa", // Light background
        dark: "#343a40", // Dark text
        border: "#dee2e6", // Border color
        success: "#28a745", // Success green
        danger: "#dc3545", // Danger red
    };

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        nic: "",
        dob: null,
        age: 0,
        gender: "",
        contactNumber: "",
        email: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.dob) {
            const today = new Date();
            const birthDate = new Date(formData.dob);

            let years = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Adjust if birthday hasn't occurred yet this year
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                years--;
            }

            setFormData((prev) => ({ ...prev, age: years }));
        }
    }, [formData.dob]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
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
            newErrors.nic =
                "Invalid NIC format (Use 123456789V or 123456789012)";
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
            showAlert(
                "Validation Error",
                "Please correct the highlighted fields",
                "warning"
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post("http://localhost:5000/api/users/register", {
                ...formData,
                dob: formData.dob.toISOString(),
            });

            showAlert("Success!", "User registered successfully", "success");
            resetForm();
            navigate("/users");
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Registration failed";
            showAlert("Error!", errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            nic: "",
            dob: null,
            age: { years: 0, months: 0 },
            gender: "",
            contactNumber: "",
            email: "",
        });
        setErrors({});
    };

    const showAlert = (title, text, icon) => {
        Swal.fire({
            title,
            text,
            icon,
            background: colors.light,
            confirmButtonColor: colors.primary,
            iconColor:
                icon === "success"
                    ? colors.success
                    : icon === "error"
                    ? colors.danger
                    : colors.secondary,
        });
        
    };

    
    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: "100vh",
                backgroundColor: colors.light,
            }}
        >
            <Card
                className="shadow-lg"
                style={{
                    width: "850px",
                    borderColor: colors.border,
                }}
            >
                <Card.Header
                    className="py-3"
                    style={{
                        backgroundColor: colors.primary,
                        borderBottom: `3px solid ${colors.secondary}`,
                    }}
                >
                    <div className="d-flex align-items-center">
                        <Button
                            variant="link"
                            onClick={() => window.history.back()}
                            className="p-0 me-2 text-white"
                        >
                            <FiArrowLeft size={24} />
                        </Button>
                        <h4 className="mb-0 text-white">USER REGISTRATION</h4>
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        First Name
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.firstName}
                                            placeholder="Enter first name"
                                            style={{
                                                borderColor: errors.firstName
                                                    ? colors.danger
                                                    : colors.border,
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Last Name
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            isInvalid={!!errors.lastName}
                                            placeholder="Enter last name"
                                            style={{
                                                borderColor: errors.lastName
                                                    ? colors.danger
                                                    : colors.border,
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        NIC Number
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiCreditCard />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="nic"
                                            value={formData.nic}
                                            onChange={handleChange}
                                            isInvalid={!!errors.nic}
                                            placeholder="Enter NIC (123456789V or 123456789012)"
                                            style={{
                                                borderColor: errors.nic
                                                    ? colors.danger
                                                    : colors.border,
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
                                    <Form.Label className="fw-bold">
                                        Email Address
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiMail />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            isInvalid={!!errors.email}
                                            placeholder="Enter email address"
                                            style={{
                                                borderColor: errors.email
                                                    ? colors.danger
                                                    : colors.border,
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Contact Number
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiPhone />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            isInvalid={!!errors.contactNumber}
                                            placeholder="Enter contact number (10 digits)"
                                            style={{
                                                borderColor:
                                                    errors.contactNumber
                                                        ? colors.danger
                                                        : colors.border,
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.contactNumber}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Gender
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiUserCheck />
                                        </InputGroup.Text>
                                        <Form.Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            isInvalid={!!errors.gender}
                                            style={{
                                                borderColor: errors.gender
                                                    ? colors.danger
                                                    : colors.border,
                                            }}
                                        >
                                            <option value="">
                                                Select Gender
                                            </option>
                                            <option value="male">Male</option>
                                            <option value="female">
                                                Female
                                            </option>
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
                                    <Form.Label className="fw-bold">
                                        Date of Birth
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiCalendar />
                                        </InputGroup.Text>
                                        <DatePicker
                                            selected={formData.dob}
                                            onChange={(date) =>
                                                setFormData({
                                                    ...formData,
                                                    dob: date,
                                                })
                                            }
                                            className={`form-control ${
                                                errors.dob ? "is-invalid" : ""
                                            }`}
                                            dateFormat="yyyy-MM-dd"
                                            maxDate={new Date()}
                                            showYearDropdown
                                            dropdownMode="select"
                                            placeholderText="Select date of birth"
                                            style={{
                                                borderColor: errors.dob
                                                    ? colors.danger
                                                    : colors.border,
                                                width: "100%",
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
                                    <Form.Label className="fw-bold">
                                        Age
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                backgroundColor:
                                                    colors.secondary,
                                                color: colors.primary,
                                            }}
                                        >
                                            <FiUser />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            value={
                                                formData.age > 0
                                                    ? `${formData.age} years`
                                                    : ""
                                            }
                                            readOnly
                                            className="bg-light"
                                            placeholder="Age will calculate automatically"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                variant="outline-danger"
                                onClick={resetForm}
                                className="me-3"
                                disabled={isSubmitting}
                                style={{
                                    borderColor: colors.danger,
                                    color: colors.danger,
                                    transition: "all 0.3s ease",
                                    ":hover": {
                                        background: `linear-gradient(135deg, ${colors.danger} 0%, ${colors.light} 100%)`,
                                        color: colors.light,
                                        borderColor: colors.danger,
                                    },
                                }}
                            >
                                Clear Form
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                style={{
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                }}
                                className="d-flex align-items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            className="me-2"
                                        />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="me-2" />
                                        Register User
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UserRegister;
