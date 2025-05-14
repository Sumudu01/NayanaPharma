const express = require('express');
const Sale = require('../models/Sale');
const router = express.Router();

// GET /api/medicine-sales - Get aggregated medicine sales data
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.aggregate([
      { $unwind: '$medicines' }, // Unwind the medicines array
      {
        $lookup: {
          from: 'medicines', // Join with the Medicine collection
          localField: 'medicines.medicineId',
          foreignField: '_id',
          as: 'medicineDetails',
        },
      },
      { $unwind: '$medicineDetails' }, // Unwind the joined medicine details
      {
        $group: {
          _id: '$medicines.medicineId',
          medicineName: { $first: '$medicineDetails.name' },
          totalQuantity: { $sum: '$medicines.quantity' },
          totalPrice: { $sum: { $multiply: ['$medicines.quantity', '$medicines.price'] } },
          date: { $first: '$date' },
        },
      },
      { $sort: { date: -1 } }, // Sort by date in descending order
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;