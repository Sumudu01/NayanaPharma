import express from 'express'
const router = express.Router();
import Delivery from '../models/Delivery.js'

// Get delivery count
router.get('/count', async (req, res) => {
  try {
    const count = await Delivery.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error getting delivery count:', error);
    res.status(500).json({ message: 'Error getting delivery count' });
  }
});

// Get pending delivery count
router.get('/pending-count', async (req, res) => {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Count deliveries scheduled for today or future dates
    const count = await Delivery.countDocuments({
      deliveryDate: { $gte: today }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting pending delivery count:', error);
    res.status(500).json({ message: 'Error getting pending delivery count' });
  }
});

router.get('/alerts', async (req, res) => {
  const allDeliveries = await Delivery.find();

  const totals = {};

  // Count total quantity per medicine
  allDeliveries.forEach(delivery => {
    const name = delivery.medicineName;
    const qty = Number(delivery.quantity);

    if (totals[name]) {
      totals[name] += qty;
    } else {
      totals[name] = qty;
    }
  });

  const alerts = [];

  Object.entries(totals).forEach(([medicine, total]) => {
    if (total < 10) {
      alerts.push({
        medicine,
        available: total,
        message: `⚠️ ${medicine} stock is low: only ${total} units left.`
      });
    }
  });

  res.json(alerts);
});

router.get('/today-deliveries', async (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
  
    const deliveriesToday = await Delivery.find({ deliveryDate: today });
  
    const alerts = deliveriesToday.map(d => ({
      supplier: d.supplierName,
      medicine: d.medicineName,
      quantity: d.quantity,
      message: `🚚 ${d.quantity} units of ${d.medicineName} from ${d.supplierName} are due for delivery today!`
    }));
  
    res.json(alerts);
});

export default router;
