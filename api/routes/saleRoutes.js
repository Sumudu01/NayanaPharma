import express from 'express';
import Sale from '../models/Sale.js';
import { 
  getAllSales, 
  createSale, 
  updateSale, 
  deleteSale,
  getSaleById 
} from '../controllers/saleController.js';

const router = express.Router();

// Get sales count
router.get('/count', async (req, res) => {
  try {
    const count = await Sale.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting sales count:', error);
    res.status(500).json({ message: 'Error getting sales count' });
  }
});

router.get('/', getAllSales);
router.get('/:id', getSaleById);      // New route to get single sale
router.post('/', createSale);
router.put('/:id', updateSale);       // Update route
router.delete('/:id', deleteSale);    // Delete route


export default router