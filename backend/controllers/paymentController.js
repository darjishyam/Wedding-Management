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
                purpose: 'Premium Upgrade',
                mode: 'Mock',
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

const paypal = require('paypal-rest-sdk');

// Configure PayPal
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// ... existing Razorpay logic ...

// --- PayPal Logic ---

const axios = require('axios');
const qs = require('querystring');

// Helper to get Access Token
const getPayPalAccessToken = async () => {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    try {
        const response = await axios.post(
            'https://api-m.sandbox.paypal.com/v1/oauth2/token',
            qs.stringify({ grant_type: 'client_credentials' }),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("PayPal Token Error:", error.response ? error.response.data : error.message);
        throw new Error("Could not get PayPal Token");
    }
};

const createPayPalPayment = async (req, res) => {
    const returnUrl = `http://localhost:${process.env.PORT || 5000}/api/payment/paypal/success?userId=${req.user._id}`;
    const cancelUrl = `http://localhost:${process.env.PORT || 5000}/api/payment/paypal/cancel`;

    try {
        const accessToken = await getPayPalAccessToken();

        const paymentJson = {
            intent: "sale",
            payer: { payment_method: "paypal" },
            redirect_urls: { return_url: returnUrl, cancel_url: cancelUrl },
            transactions: [{
                item_list: {
                    items: [{
                        name: "Premium Upgrade",
                        sku: "001",
                        price: "5.99",
                        currency: "USD",
                        quantity: 1
                    }]
                },
                amount: { currency: "USD", total: "5.99" },
                description: "Premium Membership"
            }]
        };

        const response = await axios.post(
            'https://api-m.sandbox.paypal.com/v1/payments/payment',
            paymentJson,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const approvalUrl = response.data.links.find(link => link.rel === 'approval_url');
        if (approvalUrl) {
            res.json({ approvalUrl: approvalUrl.href });
        } else {
            res.status(400).json({ message: "No approval URL returned" });
        }

    } catch (error) {
        console.error("PayPal Create Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "PayPal creation failed", error: error.message });
    }
};

const executePayPalPayment = async (req, res) => {
    const paymentId = req.query.paymentId;
    const payerId = req.query.PayerID;
    const userId = req.query.userId;

    try {
        const accessToken = await getPayPalAccessToken();

        const response = await axios.post(
            `https://api-m.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`,
            { payer_id: payerId },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const payment = response.data;
        console.log("PayPal Payment Success:", JSON.stringify(payment));

        if (payment.state === 'approved') {
            await User.findByIdAndUpdate(userId, { isPremium: true });

            await Payment.create({
                user: userId,
                amount: 499,
                purpose: 'Premium Upgrade',
                mode: 'PayPal',
                status: 'Success',
                transactionId: payment.id,
                details: payment
            });

            res.send(`
                <h1>Payment Successful!</h1>
                <p>Your account has been upgraded to Premium.</p>
                <p>You can now close this window and return to the app.</p>
            `);
        } else {
            res.status(400).send("Payment not approved");
        }

    } catch (error) {
        console.error("PayPal Execute Error:", error.response ? error.response.data : error.message);
        res.redirect(`exp://?status=error&message=${encodeURIComponent("Payment Execution Failed")}`);
    }
};

const cancelPayPalPayment = (req, res) => {
    res.send("Payment Cancelled");
};

module.exports = { createOrder, verifyPayment, simulatePayment, createPayPalPayment, executePayPalPayment, cancelPayPalPayment };
