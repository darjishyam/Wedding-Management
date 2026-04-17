const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    mobile: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    otp: String,
    otpExpires: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String, // URL or Base64
        default: "",
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
