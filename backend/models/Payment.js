const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    weddingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding'
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: 'Premium',
    },
    method: {
        type: String, // 'Razorpay', 'Mock', etc.
        default: 'Mock',
    },
    transactionId: {
        type: String,
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
