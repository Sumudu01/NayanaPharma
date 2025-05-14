import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./DeliveryCRUD.css";

const DeliveryCRUD = () => {
  const [form, setForm] = useState({
    supplierName: "",
    medicineName: "",
    quantity: "",
    pickupDate: "",
    deliveryDate: "",
  });

  const [deliveries, setDeliveries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  // Load deliveries from API
  const loadDeliveries = () => {
    axios
      .get("http://localhost:5000/api/deliveries")
      .then((res) => setDeliveries(res.data))
      .catch((err) => console.error("Failed to load deliveries", err));
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  // Handle form submission (Insert or Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validation checks
    if (!form.supplierName.trim()) {
      setError("Supplier Name is required!");
      return;
    }
    if (!form.medicineName.trim()) {
      setError("Medicine Name is required!");
      return;
    }
    if (form.quantity <= 0 || isNaN(form.quantity)) {
      setError("Quantity must be a positive number!");
      return;
    }
    if (new Date(form.pickupDate) > new Date(form.deliveryDate)) {
      setError("Pickup Date cannot be after Delivery Date!");
      return;
    }

    // Determine request type (POST for insert, PUT for update)
    const method = editId ? "put" : "post";
    const url = editId
      ? `http://localhost:5000/api/deliveries/${editId}`
      : "http://localhost:5000/api/deliveries";

    axios[method](url, form)
      .then(() => {
        setForm({
          supplierName: "",
          medicineName: "",
          quantity: "",
          pickupDate: "",
          deliveryDate: "",
        });
        setEditId(null);
        loadDeliveries();
      })
      .catch((err) => console.error("Failed to submit delivery", err));
  };

  // Load data into the form for editing
  const handleEdit = (delivery) => {
    setEditId(delivery._id);
    setForm(delivery);
  };

  // Delete a delivery
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/deliveries/${id}`)
      .then(() => loadDeliveries())
      .catch((err) => console.error("Failed to delete", err));
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Medicine Delivery Report", 14, 20);

    const tableColumn = [
      "Supplier",
      "Medicine",
      "Quantity",
      "Pickup Date",
      "Delivery Date",
    ];
    const tableRows = deliveries.map((delivery) => [
      delivery.supplierName,
      delivery.medicineName,
      delivery.quantity,
      delivery.pickupDate,
      delivery.deliveryDate,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save("medicine-delivery-report.pdf");
  };

  return (
    <div className="crud-container">
      <h2 className="crud-title">
        {editId ? "Update Delivery" : "Add New Delivery"}
      </h2>

      {/* Display Validation Errors */}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="delivery-form">
        <input
          type="text"
          placeholder="Supplier Name"
          value={form.supplierName}
          onChange={(e) =>
            setForm({ ...form, supplierName: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Medicine Name"
          value={form.medicineName}
          onChange={(e) =>
            setForm({ ...form, medicineName: e.target.value })
          }
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
          min="1"
          required
        />
        <input
          type="date"
          value={form.pickupDate}
          onChange={(e) =>
            setForm({ ...form, pickupDate: e.target.value })
          }
          required
        />
        <input
          type="date"
          value={form.deliveryDate}
          onChange={(e) =>
            setForm({ ...form, deliveryDate: e.target.value })
          }
          required
        />
        <button type="submit">{editId ? "Update" : "Add"}</button>
      </form>

      <div style={{ margin: "20px 0" }}>
        <button
          onClick={generatePDF}
          style={{
            padding: "10px 18px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          📥 Download Delivery Report (PDF)
        </button>
      </div>

      <h2 className="crud-title">All Deliveries</h2>
      <ul className="delivery-list">
        {deliveries.map((d) => (
          <li key={d._id} className="delivery-item">
            <div>
              <strong>{d.supplierName}</strong> — {d.medicineName} —{" "}
              {d.quantity} pcs
            </div>
            <div className="delivery-actions">
              <button onClick={() => handleEdit(d)}>Edit</button>
              <button onClick={() => handleDelete(d._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeliveryCRUD;
