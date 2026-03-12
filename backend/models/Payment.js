const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    weddingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding'
    },
    amount: {
        type: Number,
        required: true,
    },
    purpose: {
        type: String,
        default: 'Premium Upgrade',
    },
    mode: {
        type: String, // 'Razorpay', 'Mock', etc.
        default: 'Mock',
    },
    transactionId: {
        type: String,
        index: true,
    },
    status: {
        type: String,
        enum: ['Success', 'Failed', 'Pending'],
        default: 'Success',
    },
    isTestPayment: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
