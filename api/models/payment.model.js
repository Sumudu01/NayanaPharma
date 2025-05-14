import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    petId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    order:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    p_method: {
        type: String,
        required: true,
        trim: true
    },
    crd_number: {
        type: String,
        required: true,
        trim: true
    },
    expd_date: {
        type: String,
        required: true,
        trim: true
    },
    cvv: {
        type: String,
        required: true,
        trim: true
    },
    
   

  
}, { timestamps: true });

const Payment = mongoose.model("Payments", itemSchema);

export default Payment;
