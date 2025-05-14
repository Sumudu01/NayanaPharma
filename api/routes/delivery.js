const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');

// Get all deliveries
router.get('/', async (req, res) => {
  const deliveries = await Delivery.find();
  res.json(deliveries);
});

// Create delivery
router.post('/', async (req, res) => {
  const newDelivery = new Delivery(req.body);
  await newDelivery.save();
  res.json({ message: 'Delivery created successfully' });
});

// Update delivery
router.put('/:id', async (req, res) => {
  await Delivery.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Delivery updated successfully' });
});

// Delete delivery
router.delete('/:id', async (req, res) => {
  await Delivery.findByIdAndDelete(req.params.id);
  res.json({ message: 'Delivery deleted successfully' });
});

module.exports = router;
