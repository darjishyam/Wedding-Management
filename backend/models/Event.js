const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    wedding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    name: {
        type: String, // e.g. Haldi, Sangeet
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String, // e.g. "10:00 AM"
    },
    venue: {
        type: String,
    },
    description: {
        type: String,
    },
    itinerary: [{
        time: String,
        activity: String,
        personInCharge: String,
    }],
    status: {
        type: String,
        enum: ['Upcoming', 'Completed', 'Cancelled'],
        default: 'Upcoming',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
