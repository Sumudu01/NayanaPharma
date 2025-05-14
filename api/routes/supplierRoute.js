
import express from "express"
import Supplier from "../models/Supplier.js"

const router = express.Router()

// Add Supplier
router.route("/add").post(async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        await newSupplier.save();
        res.status(201).json({ message: "Supplier Added!", supplier: newSupplier });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Suppliers
router.route("/").get(async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Delete Supplier
router.route("/delete/:id").delete(async (req, res) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!deletedSupplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        res.json({ message: "Supplier deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Supplier by ID
router.route("/get/:id").get(async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Performance Metrics
router.route("/performance/:id").put(async (req, res) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { 
                performanceMetrics: req.body,
                "performanceMetrics.lastUpdated": new Date() 
            },
            { new: true }
        );
        res.json(updatedSupplier);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.get("/search/:query", async (req, res) => {
    const searchQuery = req.params.query;

    try {
        // Step 1: Perform a text search across indexed fields
        const suppliers = await Supplier.find({
            $or: [
                { SupplierName: { $regex: searchQuery, $options: 'i' } },
                { SupplierContact: { $regex: searchQuery, $options: 'i' } },
                { SupplierEmail: { $regex: searchQuery, $options: 'i' } },
                { SupplierAddress: { $regex: searchQuery, $options: 'i' } },
                { SupplierType: { $regex: searchQuery, $options: 'i' } },
                { SupplierStatus: { $regex: searchQuery, $options: 'i' } },
                { SupplierProducts: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        // Step 2: Return the result or handle if no suppliers are found
        if (suppliers.length === 0) {
            return res.status(404).json({ message: "No suppliers found matching your query." });
        }

        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: "Error searching suppliers", error: error.message });
    }
});
// Get Supplier Counts (Total, Active, Inactive)
router.get("/counts", async (req, res) => {
    try {
        const totalSuppliers = await Supplier.countDocuments();
        const activeSuppliers = await Supplier.countDocuments({ SupplierStatus: "Active" });
        const inactiveSuppliers = await Supplier.countDocuments({ SupplierStatus: "Inactive" });

        res.json({ totalSuppliers, activeSuppliers, inactiveSuppliers });
    } catch (error) {
        console.error("Error fetching supplier counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Suppliers Grouped by Type
router.get("/suppliers-by-type", async (req, res) => {
    try {
        const suppliersByType = await Supplier.aggregate([
            { $group: { _id: "$SupplierType", supplierCount: { $sum: 1 } } }
        ]);
        res.json(suppliersByType);
    } catch (error) {
        console.error("Error fetching suppliers by type:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Update Supplier Status
router.put("/update-status", async (req, res) => {
    try {
        const { supplierId, status } = req.body;

        // Validate inputs
        if (!supplierId || !status) {
            return res.status(400).json({ success: false, message: "Supplier ID and status are required." });
        }

        // Check if supplier exists
        const existingSupplier = await Supplier.findById(supplierId);
        if (!existingSupplier) {
            return res.status(404).json({ success: false, message: "Supplier not found." });
        }

        // Update status
        existingSupplier.SupplierStatus = status;
        await existingSupplier.save();

        res.status(200).json({
            success: true,
            message: `Supplier status updated to '${status}' successfully.`,
            updatedSupplier: existingSupplier,
        });
    } catch (error) {
        console.error("Error updating supplier status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Update Supplier
router.route("/update/:id").put(async (req, res) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSupplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        res.json({ message: "Supplier updated", supplier: updatedSupplier });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//Get active Suppliers
router.get("/active-suppliers", async (req, res) => {
    try {
        const activeSuppliers = await Supplier.find({ SupplierStatus: "Active" });
        res.json(activeSuppliers);
    } catch (error) {
        console.error("Error fetching active suppliers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get count of suppliers with contracts expiring in the next 30 days
router.get("/expiring-contracts-count", async (req, res) => {
    try {
        // Calculate date 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        // Find suppliers whose contract end date is within the next 30 days
        const count = await Supplier.countDocuments({
            ContractEndDate: {
                $gte: new Date(),
                $lte: thirtyDaysFromNow
            }
        });
        
        res.json({ count });
    } catch (error) {
        console.error("Error fetching expiring contracts count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get suppliers with contracts expiring in the next 30 days
router.get("/expiring-contracts", async (req, res) => {
    try {
        // Calculate date 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        // Find suppliers whose contract end date is within the next 30 days
        const suppliers = await Supplier.find({
            ContractEndDate: {
                $gte: new Date(),
                $lte: thirtyDaysFromNow
            }
        });
        
        res.json(suppliers);
    } catch (error) {
        console.error("Error fetching expiring contracts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
