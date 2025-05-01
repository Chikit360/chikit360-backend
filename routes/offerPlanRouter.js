const express = require('express');
const { getOfferPlans ,createOfferPlan ,getOfferPlanById , updateOfferPlan,deleteOfferPlan} = require('../controllers/offerPlanController');
const router = express.Router();
const authMiddleware=require("../middlewares/authMiddleware")

// Route to get all customers
router.get('/', getOfferPlans);


router.post("/",authMiddleware.verifyToken, createOfferPlan);
router.get("/:id",authMiddleware.verifyToken, getOfferPlanById);
router.put("/:id",authMiddleware.verifyToken, updateOfferPlan);
router.delete("/:id",authMiddleware.verifyToken, deleteOfferPlan);


module.exports = router;
