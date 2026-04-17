const mongoose = require('mongoose');

const chatHistorySchema = mongoose.Schema({
    wedding: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Wedding'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sender: {
        type: String, // 'user' or 'ai'
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
