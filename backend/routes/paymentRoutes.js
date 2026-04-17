const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/simulate', protect, require('../controllers/paymentController').simulatePayment);

// Razorpay Hosted Routes
router.get('/razorpay-checkout', require('../controllers/paymentController').razorpayCheckoutPage);
router.get('/razorpay/success', require('../controllers/paymentController').razorpaySuccessCallback);
router.get('/razorpay/cancel', (req, res) => res.send("Payment Cancelled. You can return to the app."));

module.exports = router;
