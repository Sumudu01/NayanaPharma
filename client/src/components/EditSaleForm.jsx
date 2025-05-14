import React, { useState, useEffect } from 'react';
import api from '../axios';

const EditSaleForm = ({ sale, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    customerId: sale.customerId,
    medicines: [...sale.medicines],
    totalAmount: sale.totalAmount
  });
  const [allMedicines, setAllMedicines] = useState([]);

  // Fetch all medicines for dropdown
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicines');
        setAllMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    
    // Recalculate total if quantity or price changes
    if (field === 'quantity' || field === 'price') {
      const total = updatedMedicines.reduce(
        (sum, med) => sum + (med.quantity * med.price), 0
      );
      setFormData(prev => ({ ...prev, medicines: updatedMedicines, totalAmount: total }));
    } else {
      setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
    }
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { medicineId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeMedicine = (index) => {
    const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
    const total = updatedMedicines.reduce(
      (sum, med) => sum + (med.quantity * med.price), 0
    );
    setFormData(prev => ({ ...prev, medicines: updatedMedicines, totalAmount: total }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      _id: sale._id
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Customer ID</label>
        <input
          type="text"
          className="form-control"
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          required
        />
      </div>

      <h5>Medicines</h5>
      {formData.medicines.map((medicine, index) => (
        <div key={index} className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Medicine</label>
            <select
              className="form-select"
              value={medicine.medicineId}
              onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value)}
              required
            >
              <option value="">Select Medicine</option>
              {allMedicines.map(med => (
                <option key={med._id} value={med._id}>
                  {med.name} (${med.price})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={medicine.quantity}
              onChange={(e) => handleMedicineChange(index, 'quantity', parseInt(e.target.value))}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              value={medicine.price}
              onChange={(e) => handleMedicineChange(index, 'price', parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeMedicine(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={addMedicine}
      >
        Add Medicine
      </button>

      <div className="mb-3">
        <label className="form-label">Total Amount</label>
        <input
          type="number"
          className="form-control"
          value={formData.totalAmount.toFixed(2)}
          readOnly
        />
      </div>

      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditSaleForm;