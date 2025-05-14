import express from 'express'
const router = express.Router();
import Sale from '../models/Sale.js'

// Get sales count
router.get('/count', async (req, res) => {
  try {
    const count = await Sale.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error getting sales count:', error);
    res.status(500).json({ message: 'Error getting sales count' });
  }
});

// Other sales routes...

export default router