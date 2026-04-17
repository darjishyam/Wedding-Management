const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    wedding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Catering', 'Decoration', 'Photography', 'Venue', 'Makeup', 'Music', 'Other'],
        default: 'Other',
    },
    contact: {
        type: String,
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid'],
        default: 'Pending',
    },
    payments: [{
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        mode: { type: String, default: 'Cash' }, // Cash, UPI, Online
        note: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

vendorSchema.virtual('remainingAmount').get(function () {
    return this.totalAmount - this.paidAmount;
});

module.exports = mongoose.model('Vendor', vendorSchema);
