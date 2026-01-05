const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/simulate', protect, require('../controllers/paymentController').simulatePayment);

module.exports = router;
