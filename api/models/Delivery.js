import { Schema, model } from 'mongoose';

const deliverySchema = new Schema({
  supplierName: { type: String, required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pickupDate: { type: String, required: true },
  deliveryDate: { type: String, required: true }
});

export default model('Delivery', deliverySchema);
