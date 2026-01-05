const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

const createOrder = async (req, res) => {
    try {
        const options = {
            amount: 49900, // ₹499.00
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Payment Order Error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    // Original Real Logic kept for reference/future enablement
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            await User.findByIdAndUpdate(req.user._id, { isPremium: true });
            res.json({ success: true, message: "Payment Verified & User Upgraded" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

const simulatePayment = async (req, res) => {
    console.log("Simulating Payment (or Reset) for User:", req.user._id);
    try {
        const isReset = req.body && req.body.reset === true;
        const update = { isPremium: !isReset };

        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });

        if (isReset) {
            res.json({ success: true, message: "Premium Reset (Dev Mode)", user });
        } else {
            // Create Payment Record
            await Payment.create({
                user: req.user._id,
                // weddingId: req.user.weddingId // If we had easy access, but let's leave it null for now or fetch if needed
                amount: 499,
                type: 'Premium Upgrade',
                method: 'Mock',
                status: 'Success',
                transactionId: 'MOCK_' + Date.now(),
                isTestPayment: true
            });

            res.json({ success: true, message: "Mock Payment Successful. Premium Activated!", user });
        }
    } catch (error) {
        console.error("Mock Payment Error:", error);
        res.status(500).json({ message: "Mock Upgrade Failed", error: error.message });
    }
};

module.exports = { createOrder, verifyPayment, simulatePayment };
