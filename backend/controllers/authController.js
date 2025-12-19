const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wedding = require('../models/Wedding');
const Guest = require('../models/Guest');
const Expense = require('../models/Expense');
const Shagun = require('../models/Shagun');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, mobile, firebaseVerified } = req.body;

    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            if (userByEmail.isVerified) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            // If unverified, we will update this user instead of creating new
        }

        let userByMobile = await User.findOne({ mobile });
        if (userByMobile) {
            if (userByMobile.isVerified) {
                return res.status(400).json({ message: 'User with this mobile number already exists' });
            }
            // If unverified, we will update this user
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // If verified by Firebase, allow immediate creation
        if (firebaseVerified) {
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                mobile,
                isVerified: true
            });

            if (user) {
                return res.status(201).json({
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    token: generateToken(user.id),
                    message: 'User registered successfully via Firebase'
                });
            }
        }

        // Standard flow
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log('\n\n');
        console.log('==================================================');
        console.log(`🔒  OTP FOR ${mobile} IS:  ${otp}  🔒`);
        console.log('==================================================');
        console.log('\n\n');

        let user;
        const existingUser = userByEmail || userByMobile;

        if (existingUser) {
            // Force update to ensure OTP is saved
            await User.updateOne(
                { _id: existingUser._id },
                {
                    $set: {
                        name,
                        email,
                        password: hashedPassword,
                        mobile,
                        otp,
                        otpExpires
                    }
                }
            );
            user = await User.findById(existingUser._id);
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                mobile,
                otp,
                otpExpires,
            });
        }

        if (user) {
            res.status(201).json({
                message: 'OTP sent to mobile number',
                mobile: user.mobile,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { mobile, otp } = req.body;

    try {
        const user = await User.findOne({ mobile });

        console.log('\n--- VERIFY OTP DEBUG ---');
        console.log('Mobile:', mobile);
        console.log('User Found:', user ? user.mobile : 'NO USER');
        if (user) {
            console.log('Stored OTP:', user.otp, 'Type:', typeof user.otp);
            console.log('Received OTP:', otp, 'Type:', typeof otp);
            console.log('Expiry:', user.otpExpires);
            console.log('Now:', Date.now());
            console.log('Expired?', user.otpExpires < Date.now());
            console.log('Match?', String(user.otp).trim() === String(otp).trim());
        }
        console.log('------------------------\n');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user is already verified, return success immediately (idempotency for double submits)
        if (user.isVerified) {
            return res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        }

        if (String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login Attempt:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Login Failed: User not found for email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User Found:', user.email, 'Verified:', user.isVerified);

        if (!user.isVerified) {
            console.log('Login Failed: Not Verified');
            return res.status(401).json({ message: 'Account not verified. Please verify OTP.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', isMatch);

        if (isMatch) {
            console.log('Login Success!');
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            console.log('Login Failed: Password Mismatch');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account and all data
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all associated data
        await Wedding.deleteMany({ user: userId });
        await Guest.deleteMany({ user: userId });
        await Expense.deleteMany({ user: userId });
        await Shagun.deleteMany({ user: userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, verifyOtp, deleteAccount };
