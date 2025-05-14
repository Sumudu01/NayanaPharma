import mongoose from "mongoose";
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    SupplierName: { type: String, required: true, index: true },
    SupplierContact: { type: String, required: true },
    SupplierEmail: { type: String, required: true },
    SupplierAddress: { type: String, required: true },
    SupplierType: { type: String, required: true, index: true },
    SupplierStatus: { type: String, required: true, default: "Active" },
    SupplierContractStartDate: { type: Date, required: true },
    SupplierContractEndDate: { type: Date, required: true },
    SupplierTotalOrders: { type: Number, default: 0 },
    SupplierProducts: { type: String, required: true },
    performanceMetrics: {
        communication: { type: Number, min: 1, max: 5, default: 3 },
        quality: { type: Number, min: 1, max: 5, default: 3 },
        averageDeliveryTime: Number,
        onTimeDeliveryRate: Number,
        lastUpdated: Date,
    },
});

// Create a text index for search functionality
supplierSchema.index({
    SupplierName: "text",
    SupplierContact: "text",
    SupplierEmail: "text",
    SupplierAddress: "text",
    SupplierType: "text",
    SupplierProducts: "text",
});

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
