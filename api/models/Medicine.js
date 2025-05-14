const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  manufacturer: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

module.exports = mongoose.model('Medicine', MedicineSchema);