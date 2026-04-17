const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
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
    // Budget Planning Breakdown (Normalized)
    budgetBreakdown: {
        catering: { type: Number, default: 0 },
        decoration: { type: Number, default: 0 },
        venue: { type: Number, default: 0 },
        photography: { type: Number, default: 0 },
        travel: { type: Number, default: 0 },
        makeup: { type: Number, default: 0 },
        otherExpenses: { type: Number, default: 0 },
    },
    weddingSide: {
        type: String, // Bride/Groom
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['Planned', 'Ongoing', 'Completed', 'Archived'],
        default: 'Planned'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Wedding', weddingSchema);
