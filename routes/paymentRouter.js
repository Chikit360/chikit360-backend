const express = require('express');
const {  createOrder, verifyPayment } = require('../controllers/paymentController');
const router = express.Router();

// Route to get all customers
router.post('/orders', createOrder);
router.post('/success', verifyPayment);


module.exports = router;
