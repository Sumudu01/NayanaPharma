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
    sup_name: {
        type: String,
        required: true,
        trim: true
    },
    ProductId: {
        type: String,
        required: true,
        trim: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    stock_quentity: {
        type: String,
        required: true,
        trim: true
    },
    sold_quentity: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true
    },
   
   
   
}, { timestamps: true });

const Item = mongoose.model("Inventory", itemSchema);

export default Item;
