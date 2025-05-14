import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import Swal from "sweetalert2";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Table, Form, Card, Container, Row, Col, Alert, Tabs, Tab } from "react-bootstrap";
import './css/addpet.css';
import { Blockquote } from 'flowbite-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AddItem() {
  const [imagePercent, setImagePercent] = useState(0);
  const fileRef1 = useRef(null);
  const [imageError, setImageError] = useState(false);
  const [image1, setImage1] = useState(undefined);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('addProduct');
  const [suppliers, setSuppliers] = useState([]);
  const [productsBySupplier, setProductsBySupplier] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userId: currentUser?._id || '',
    sup_name: "",
    ProductId: "",
    productName: "",
    stock_quentity: "",
    sold_quentity: "",
    price: "",
    status: "",
  });

  useEffect(() => {
    if (image1) {
      handleFileUpload(image1, 'profilePicture');
    }
  }, [image1]);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/supplier/active-suppliers");
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch products by supplier
  useEffect(() => {
    const fetchProductsBySupplier = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/auth/allproducts");

        // Group products by supplier
        const groupedProducts = response.data.reduce((acc, product) => {
          const supplierName = product.sup_name;
          if (!acc[supplierName]) {
            acc[supplierName] = {
              products: 0,
              totalStock: 0,
              totalSold: 0,
              productNames: []
            };
          }
          acc[supplierName].products += 1;
          acc[supplierName].totalStock += parseInt(product.stock_quentity || 0);
          acc[supplierName].totalSold += parseInt(product.sold_quentity || 0);
          acc[supplierName].productNames = acc[supplierName].productNames || [];
          acc[supplierName].productNames.push(product.productName);
          return acc;
        }, {});

        // Convert to array format for chart
        const chartData = Object.keys(groupedProducts).map(supplier => ({
          name: supplier,
          products: groupedProducts[supplier].products,
          totalStock: groupedProducts[supplier].totalStock,
          totalSold: groupedProducts[supplier].totalSold,
          productNames: groupedProducts[supplier].productNames
        }));

        setProductsBySupplier(chartData);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Sample data for testing
        setProductsBySupplier([
          { name: "Supplier A", products: 5, totalStock: 500, totalSold: 200, productNames: ["Product A1", "Product A2", "Product A3"] },
          { name: "Supplier B", products: 3, totalStock: 300, totalSold: 150, productNames: ["Product B1", "Product B2"] },
          { name: "Supplier C", products: 7, totalStock: 700, totalSold: 350, productNames: ["Product C1", "Product C2", "Product C3"] },
          { name: "Supplier D", products: 2, totalStock: 200, totalSold: 100, productNames: ["Product D1"] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsBySupplier();
  }, []);

  const handleFileUpload = async (image, field) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      () => {
        setImageError(true);
        setError('Image upload failed');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            [field]: downloadURL
          }));
        });
      }
    );
  };

  const handleImage1Click = () => {
    fileRef1.current.click();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.ProductId.trim()) errors.ProductId = 'Product ID is required';
    if (!formData.productName.trim()) errors.productName = 'Product Name is required';
    if (!formData.stock_quentity.trim() || isNaN(formData.stock_quentity) || formData.stock_quentity <= 0)
      errors.stock_quentity = 'Stock quantity must be a positive number';
    if (!formData.sold_quentity.trim() || isNaN(formData.sold_quentity) || formData.sold_quentity < 0)
      errors.sold_quentity = 'Sold quantity must be 0 or a positive number';
    if (!formData.price.trim() || isNaN(formData.price) || formData.price <= 0)
      errors.price = 'Price must be a positive number';
    if (!formData.status) errors.status = 'Please select a status';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const res = await fetch('/api/auth/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create item');
      }

      Swal.fire({ icon: "success", title: "Success", text: "Item added successfully!" });
      navigate('/inventory/list ');
    } catch (error) {
      console.log(error)
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Something went wrong." });
    }
  };

  // Define colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="d-flex flex-column align-items-center">
      <Container fluid className="dashboard-container p-4 shadow-lg rounded bg-light" style={{ maxWidth: "90%", marginTop: "3%", marginBottom: "2%" }}>
        <Row>
          <Col>
            <h2 className="text-center mb-4" style={{ fontSize: 30, fontWeight: 'bold' }}>Inventory Management</h2>
          </Col>
        </Row>

        <Row>
          {/* Left column - Keep the existing form */}
          <Col md={6}>
            <Card className="shadow mb-4">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Add Inventory Product</h4>
              </Card.Header>
              <Card.Body>
                <form onSubmit={handleSubmit} className="p-2" id="marg1">
                  <div className="mb-3">
                    <label className="form-label">Supplier Name</label>
                    <select className="form-select" onChange={(e) => setFormData({ ...formData, sup_name: e.target.value })}>
                      <option value="">Select Supplier</option>

                      {suppliers.map(supplier => (
                        <option value={supplier.SupplierName}>{supplier.SupplierName}</option>
                      ))}
                    </select>
                  </div>
                  {/* Product ID */}
                  <div className="mb-3">
                    <label className="form-label">Product ID</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.ProductId ? 'is-invalid' : ''}`}
                      placeholder="Enter Product ID"
                      onChange={(e) => setFormData({ ...formData, ProductId: e.target.value })}
                    />
                    <div className="invalid-feedback">{formErrors.ProductId}</div>
                  </div>

                  {/* Product Name */}
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.productName ? 'is-invalid' : ''}`}
                      placeholder="Enter Product Name"
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    />
                    <div className="invalid-feedback">{formErrors.productName}</div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="mb-3">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className={`form-control ${formErrors.stock_quentity ? 'is-invalid' : ''}`}
                      placeholder="Enter Stock Quantity"
                      onChange={(e) => setFormData({ ...formData, stock_quentity: e.target.value })}
                    />
                    <div className="invalid-feedback">{formErrors.stock_quentity}</div>
                  </div>

                  {/* Sold Quantity */}
                  <div className="mb-3">
                    <label className="form-label">Sold Quantity</label>
                    <input
                      type="number"
                      className={`form-control ${formErrors.sold_quentity ? 'is-invalid' : ''}`}
                      placeholder="Enter Sold Quantity"
                      onChange={(e) => setFormData({ ...formData, sold_quentity: e.target.value })}
                    />
                    <div className="invalid-feedback">{formErrors.sold_quentity}</div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      step={0.01}
                      className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                      placeholder="Enter Price"
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <div className="invalid-feedback">{formErrors.price}</div>
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className={`form-select ${formErrors.status ? 'is-invalid' : ''}`}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="">Select Status</option>
                      <option>Available</option>
                      <option>Expired</option>
                      <option>Refilled</option>
                    </select>
                    <div className="invalid-feedback">{formErrors.status}</div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" id="submit-button">
                    {loading ? 'Adding Product...' : 'Add Product'}
                  </button>
                </form>
              </Card.Body>
            </Card>
          </Col>

          {/* Right column - Add the charts */}
          <Col md={6}>
            <Card className="shadow mb-4">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Products by Supplier</h4>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={productsBySupplier}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="products" fill="#8884d8" name="Total Products" />
                      <Bar dataKey="totalStock" fill="#82ca9d" name="Total Stock" />
                      <Bar dataKey="totalSold" fill="#ffc658" name="Total Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow mb-4">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Product Distribution by Supplier</h4>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productsBySupplier}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="products"
                      >
                        {productsBySupplier.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _, props) => [`${value} products`, props.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom section - Add a data table */}
        <Row>
          <Col>
            <Card className="shadow mb-4">
              <Card.Header className="bg-dark text-white">
                <h4 className="mb-0">Supplier Product Details</h4>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Supplier Name</th>
                      <th>Total Products</th>
                      <th>Total Stock</th>
                      <th>Total Sold</th>
                      <th>Stock Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsBySupplier.map((supplier, index) => (
                      <tr key={index}>
                        <td>{supplier.name}</td>
                        <td>{supplier.products}</td>
                        <td>{supplier.totalStock}</td>
                        <td>{supplier.totalSold}</td>
                        <td>
                          {supplier.totalStock > 0
                            ? `${((supplier.totalSold / supplier.totalStock) * 100).toFixed(1)}%`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
