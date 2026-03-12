const mongoose = require('mongoose');

const shagunSchema = new mongoose.Schema({
    wedding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
    },
    gift: {
        type: String,
    },
    contact: {
        type: String,
    },
    wishes: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Shagun', shagunSchema);
