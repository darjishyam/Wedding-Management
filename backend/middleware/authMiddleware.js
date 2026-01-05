const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    console.log('\n--- AUTH MIDDLEWARE DEBUG ---');
    console.log('Headers:', req.headers);
    console.log('Authorization Header:', req.headers.authorization);

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token Extracted:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            console.log('Decoded ID:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password');
            console.log('User Found:', req.user ? req.user.email : 'NO USER FOUND');

            next();
        } catch (error) {
            console.error('Token Verification Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    }

    if (!token) {
        console.log('No Token Found');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
    console.log('-----------------------------\n');
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
