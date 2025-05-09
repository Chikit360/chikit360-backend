const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptioncontroller');
const checkActiveSubscription = require('../middlewares/subscriptionMiddleware');

// Get all subscriptions
router.get('/', checkActiveSubscription,subscriptionController.getAllSubscriptions);


router.get('/curr', subscriptionController.getCurrSubscriptions);

// Cancel subscription by ID
router.put('/cancel/:id',checkActiveSubscription, subscriptionController.cancelSubscription);

// Get subscription by hospital ID
router.get('/:hospitalId', subscriptionController.getSubscriptionByHospital);


module.exports = router;
