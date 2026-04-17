const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        const { amount, currency, vendorId } = req.body;
        const options = {
            amount: (amount || 499) * 100, // Amount in paise
            currency: currency || "INR",
            receipt: "rcpt_" + Math.floor(Math.random() * 10000),
            notes: {
                vendorId: vendorId || null
            }
        };

        console.log("[Razorpay] Creating Order:", options);
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).json({ 
            message: "Razorpay Order Creation Failed", 
            error: error.message 
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, vendorId, amount } = req.body;
        
        console.log("[Razorpay] Verifying Payment:", { razorpay_order_id, razorpay_payment_id });

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // 1. If it was for a Vendor
            if (vendorId) {
                const vendor = await Vendor.findById(vendorId);
                if (vendor) {
                    vendor.payments.push({
                        amount: Number(amount),
                        mode: 'Online - Razorpay',
                        date: new Date(),
                        note: `Razorpay: ${razorpay_payment_id}`
                    });
                    
                    const totalPaid = vendor.payments.reduce((sum, p) => sum + p.amount, 0);
                    vendor.paidAmount = totalPaid;
                    
                    if (vendor.paidAmount >= vendor.totalAmount) vendor.status = 'Paid';
                    else if (vendor.paidAmount > 0) vendor.status = 'Partial';
                    
                    await vendor.save();
                }
            } else {
                // 2. Otherwise assume it was Premium Upgrade
                await User.findByIdAndUpdate(req.user._id, { isPremium: true });
            }
            
            // 3. Record in global Payment model
            await Payment.create({
                user: req.user._id,
                vendor: vendorId || null,
                amount: Number(amount) || 499,
                purpose: vendorId ? 'Vendor Payment' : 'Premium Upgrade',
                mode: 'Razorpay',
                status: 'Success',
                transactionId: razorpay_payment_id,
                details: req.body
            });

            res.json({ success: true, message: "Payment Successful", user: req.user });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("[Razorpay] Verification Error:", error);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

const simulatePayment = async (req, res) => {
    try {
        const isReset = req.body && req.body.reset === true;
        const update = { isPremium: !isReset };
        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });

        if (!isReset) {
            await Payment.create({
                user: req.user._id,
                amount: 499,
                purpose: 'Premium Upgrade',
                mode: 'Mock',
                status: 'Success',
                transactionId: 'MOCK_' + Date.now(),
                isTestPayment: true
            });
        }
        res.json({ success: true, message: isReset ? "Premium Reset" : "Mock Activated", user });
    } catch (error) {
        res.status(500).json({ message: "Mock Upgrade Failed", error: error.message });
    }
};

const razorpayCheckoutPage = async (req, res) => {
    const { orderId, amount, name, email, contact, vendorId, vendorAmount, userId } = req.query;
    const keyId = process.env.RAZORPAY_KEY_ID;
    
    // Determine the redirect URL based on whether it's a vendor payment
    const successRedirect = vendorId 
        ? `/api/payment/razorpay/success?order_id={order_id}&payment_id={payment_id}&signature={signature}&userId=${userId}&vendorId=${vendorId}&amount=${vendorAmount}`
        : `/api/payment/razorpay/success?order_id={order_id}&payment_id={payment_id}&signature={signature}&userId=${userId}`;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Razorpay Checkout</title>
        </head>
        <body style="background-color: #f7f8f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif;">
            <div style="text-align: center;">
                <h2 style="color: #333;">Processing Payment...</h2>
                <p style="color: #666;">Please do not close this window.</p>
            </div>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <script>
                var options = {
                    "key": "${keyId}",
                    "amount": "${amount}",
                    "currency": "INR",
                    "name": "Shagun Wedding Manager",
                    "description": "${vendorId ? 'Vendor Payment' : 'Premium Upgrade'}",
                    "order_id": "${orderId}",
                    "handler": function (response){
                        var url = "${successRedirect}"
                            .replace('{order_id}', response.razorpay_order_id)
                            .replace('{payment_id}', response.razorpay_payment_id)
                            .replace('{signature}', response.razorpay_signature);
                        window.location.href = url;
                    },
                    "prefill": {
                        "name": "${name || ''}",
                        "email": "${email || ''}",
                        "contact": "${contact || ''}"
                    },
                    "theme": { "color": "#8A0030" },
                    "modal": {
                        "ondismiss": function(){
                            window.location.href = "/api/payment/razorpay/cancel";
                        }
                    }
                };
                var rzp1 = new Razorpay(options);
                rzp1.open();
            </script>
        </body>
        </html>
    `);
};

const razorpaySuccessCallback = async (req, res) => {
    const { order_id, payment_id, signature, userId, vendorId, amount } = req.query;
    
    try {
        const body = order_id + "|" + payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === signature) {
            if (vendorId) {
                const vendor = await Vendor.findById(vendorId);
                if (vendor) {
                    vendor.payments.push({
                        amount: Number(amount),
                        mode: 'Online - Razorpay',
                        date: new Date(),
                        note: `Razorpay: ${payment_id}`
                    });
                    const totalPaid = vendor.payments.reduce((sum, p) => sum + p.amount, 0);
                    vendor.paidAmount = totalPaid;
                    vendor.status = vendor.paidAmount >= vendor.totalAmount ? 'Paid' : 'Partial';
                    await vendor.save();
                }
            } else {
                await User.findByIdAndUpdate(userId, { isPremium: true });
            }
            
            await Payment.create({
                user: userId,
                vendor: vendorId || null,
                amount: Number(amount) || 499,
                purpose: vendorId ? 'Vendor Payment' : 'Premium Upgrade',
                mode: 'Razorpay',
                status: 'Success',
                transactionId: payment_id,
                details: req.query
            });
        }
    } catch (error) {
        console.error("Callback Verification Error:", error);
    }
    
    res.send(`
        <html>
        <head>
            <title>Payment Successful</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; background: white; }
                .success-icon { color: #4CAF50; font-size: 80px; margin-bottom: 20px; }
                .btn { background: #8A0030; color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; display: inline-block; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p>${vendorId ? 'Your vendor payment' : 'Premium features'} have been processed.</p>
            <p>Transaction ID: ${payment_id}</p>
            <a href="exp://" class="btn">Return to App</a>
            <script>setTimeout(function() { window.location.href = "exp://"; }, 3000);</script>
        </body>
        </html>
    `);
};

module.exports = { 
    createOrder, 
    verifyPayment, 
    simulatePayment, 
    razorpayCheckoutPage,
    razorpaySuccessCallback
};
