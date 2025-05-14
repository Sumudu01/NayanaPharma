import mongoose  from "mongoose";

const SaleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  medicines: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now }, // Automatically set to the current date
});

export default mongoose.model('Sale', SaleSchema);