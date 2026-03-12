const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    groomName: {
        type: String,
        required: true,
    },
    groomImage: {
        type: String,
        default: "",
    },
    brideName: {
        type: String,
        required: true,
    },
    brideImage: {
        type: String,
        default: "",
    },
    date: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    totalBudget: {
        type: Number,
        default: 0,
    },
    location: {
        type: String,
    },
    venue: {
        type: String,
    },
    catering: {
        type: Number, // Cost
        default: 0,
    },
    decoration: {
        type: Number, // Cost
        default: 0,
    },
    stay: {
        type: Number, // Cost
        default: 0,
    },
    photography: {
        type: Number,
        default: 0,
    },
    travel: {
        type: Number,
        default: 0,
    },
    makeup: {
        type: Number,
        default: 0,
    },
    otherExpenses: {
        type: Number,
        default: 0,
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    shagun: {
        type: Number, // Amount
        default: 0,
    },
    income: {
        type: Number,
        default: 0,
    },
    type: {
        type: String, // India/Destination
        default: 'India',
    },
    marketType: {
        type: String, // Home/Out/Local
    },
    weddingSide: {
        type: String, // Bride/Groom
    },
    status: {
        type: String,
        enum: ['Planned', 'Ongoing', 'Completed', 'Archived'],
        default: 'Planned'
    }
});

module.exports = mongoose.model('Wedding', weddingSchema);
