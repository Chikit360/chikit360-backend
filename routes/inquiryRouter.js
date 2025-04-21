// routes/inquiryRoutes.js
const express = require('express');
const { createInquiry, getAllInquiries, updateInquiryStatus } = require('../controllers/inquirycontroller');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', createInquiry);
router.get('/',authMiddleware.verifyToken, getAllInquiries);
router.put('/:id',authMiddleware.verifyToken, updateInquiryStatus);

module.exports = router;
