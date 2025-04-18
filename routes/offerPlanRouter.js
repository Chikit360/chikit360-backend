const express = require('express');
const { getOfferPlans } = require('../controllers/offerPlanController');
const router = express.Router();

// Route to get all customers
router.get('/', getOfferPlans);


module.exports = router;
