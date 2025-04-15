const express = require('express');
const { superAdminDashboardAnalytics } = require('../controllers/superAdminController');

const router = express.Router();


// Route to get all customers
router.get('/analytics', superAdminDashboardAnalytics);

module.exports = router;
