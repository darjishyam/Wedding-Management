const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    wedding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    cityVillage: {
        type: String,
        required: true,
    },
    familyCount: {
        type: Number,
        required: true,
        default: 1,
    },
    category: {
        type: String,
        enum: ['Groom Family', 'Bride Family', 'Friend', 'Work', 'Other'],
        default: 'Other',
    },
    status: {
        type: String,
        enum: ['Not Invited', 'Invited', 'Confirmed', 'Declined'],
        default: 'Not Invited',
    },
    assignedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    isInvited: {
        type: Boolean,
        default: false,
    },
    shagunAmount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Guest', guestSchema);
