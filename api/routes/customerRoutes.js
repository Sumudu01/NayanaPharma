const express = require('express');
const { addCustomer } = require('../controllers/customerController');

const router = express.Router();

// POST /api/customers - Add a new customer
router.post('/', addCustomer);

module.exports = router;