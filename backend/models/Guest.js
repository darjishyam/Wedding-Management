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
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Declined'],
            default: 'Pending'
        }
    }],
    isInvited: {
        type: Boolean,
        default: false,
    },
    shagunAmount: {
        type: Number,
        default: 0,
    },
    // RSVP & Logistics
    rsvpToken: {
        type: String,
        unique: true,
        sparse: true, // Only if RSVP link is generated
        index: true,
    },
    attendanceCount: {
        type: Number,
        default: 0,
    },
    foodPreference: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Jain', 'Other'],
        default: 'Veg',
    },
    accommodation: {
        hotelName: String,
        roomNumber: String,
        checkIn: Date,
        checkOut: Date,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Guest', guestSchema);
