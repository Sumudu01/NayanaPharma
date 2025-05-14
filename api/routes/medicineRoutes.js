const express = require('express');
const { getAllMedicines, addMedicine } = require('../controllers/medicineController');

const router = express.Router();

// GET /api/medicines - Get all medicines
router.get('/', getAllMedicines);

// POST /api/medicines - Add a new medicine
router.post('/', addMedicine);

module.exports = router;