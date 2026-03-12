const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/simulate', protect, require('../controllers/paymentController').simulatePayment);

// PayPal Routes
router.post('/paypal/create', protect, require('../controllers/paymentController').createPayPalPayment);
router.get('/paypal/success', require('../controllers/paymentController').executePayPalPayment);
router.get('/paypal/cancel', require('../controllers/paymentController').cancelPayPalPayment);

module.exports = router;
