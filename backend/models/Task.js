const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    wedding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Venue', 'Catering', 'Attire', 'GuestList', 'Ceremony', 'Photography', 'Music', 'Other'],
        default: 'Other',
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    dueDate: {
        type: Date,
    },
    notes: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', taskSchema);
