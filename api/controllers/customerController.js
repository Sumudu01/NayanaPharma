const Customer = require('../models/Customer');

// Add a new customer
const addCustomer = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const newCustomer = new Customer({ name, email, phone });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { addCustomer };