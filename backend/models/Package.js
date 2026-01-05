const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String, // India / Destination
        default: 'India',
    },
    location: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
    },
    image: {
        type: String, // URL from ImageKit
    },
    description: String,
    totalPrice: {
        type: Number,
        required: true,
    },
    items: {
        catering: { type: Number, default: 0 },
        decoration: { type: Number, default: 0 },
        stay: { type: Number, default: 0 },
        venue: { type: Number, default: 0 },
        shagun: { type: Number, default: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Package', packageSchema);
