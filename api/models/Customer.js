const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  refillReminders: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
      refillDate: { type: Date, required: true },
    },
  ],
});

module.exports = mongoose.model('Customer', CustomerSchema);