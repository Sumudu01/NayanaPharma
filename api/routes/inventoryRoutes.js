import express from 'express';
const router = express.Router();
import { updateStock, getProductCount, getStockCount } from '../controllers/inventory.controller.js';

// Update stock quantity
router.put('/:id/update-stock', updateStock);
router.get('/product-count', getProductCount)
router.get('/stock-count', getStockCount)

export default router;