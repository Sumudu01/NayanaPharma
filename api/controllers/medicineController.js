const Medicine = require('../models/Medicine');

// Get all medicines
const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new medicine
const addMedicine = async (req, res) => {
  const { name, price, quantity, manufacturer, expiryDate } = req.body;

  // Check if all required fields are present
  if (!name || !price || !quantity || !manufacturer || !expiryDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newMedicine = new Medicine({ name, price, quantity, manufacturer, expiryDate });
    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllMedicines, addMedicine };