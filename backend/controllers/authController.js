const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wedding = require('../models/Wedding');
const Guest = require('../models/Guest');
const Expense = require('../models/Expense');
const Shagun = require('../models/Shagun');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const Task = require('../models/Task');
const ChatHistory = require('../models/ChatHistory');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');
const { sendNotification } = require('../utils/notification');

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
                    isPremium: user.isPremium,
                    role: user.role,
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

        // Check if SMTP is configured before trying to send
        if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL) {
            console.error('SMTP Environment Variables Missing');
            return res.status(500).json({ message: 'Server Email Config Missing. Please add SMTP keys to Render.' });
        }

        let user;
        const existingUser = userByEmail || userByMobile;

        // DB Operations first (Blocking but fast)
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
            // Send success response IMMEDIATELY to prevent freezing
            res.status(201).json({
                message: 'OTP sent to your email',
                mobile: user.mobile,
                email: user.email
            });

            // Send OTP via Email (BACKGROUND PROCESS - NON-BLOCKING)
            const message = `Your OTP for registration is: ${otp}\n\nIt is valid for 10 minutes.`;

            sendEmail({
                email: email,
                subject: 'Your OTP for Registration',
                message: message,
            }).then(() => {
                console.log('OTP Email sent successfully (Background)');
            }).catch((emailError) => {
                console.error('Error sending email (Background):', emailError);
                // User won't know, but at least app doesn't freeze.
            });

        } else {
            // Should not happen if create/update works
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
                isPremium: user.isPremium,
                role: user.role,
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
            isPremium: user.isPremium,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    let { email, password } = req.body;
    if (email) email = email.toLowerCase();

    // Basic validation
    if (!email || !password) {
        console.log('[Login] Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        console.log(`\n[Login Attempt] Email: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[Login Failed] User not found in DB for email: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log(`[Login Info] User Found: ${user.email} | Verified: ${user.isVerified} | ID: ${user._id}`);

        if (!user.isVerified) {
            console.log('[Login Failed] Account NOT VERIFIED');
            return res.status(401).json({ message: 'Account not verified. Please verify OTP first.' });
        }

        // Detailed check for password
        if (!user.password) {
            console.log('[Login Failed] User has no password set (likely a Google-only user)');
            return res.status(401).json({ message: 'This account uses Google Sign-In. Please use Google to log in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[Login Match] Password correct: ${isMatch}`);

        if (isMatch) {
            console.log('[Login Success] Generating token...');
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
                isPremium: user.isPremium,
                profileImage: user.profileImage,
                role: user.role,
            });
        } else {
            console.log('[Login Failed] Password mismatch');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[Login Error] Unexpected Server Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { email, name, mobile, profileImage } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // User exists, log them in
            console.log(`[Google Login] User found: ${email}`);

            // Optional: Update profile image if missing
            if (!user.profileImage && profileImage) {
                user.profileImage = profileImage;
                await user.save();
            }

            return res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                token: generateToken(user.id),
                isPremium: user.isPremium,
                profileImage: user.profileImage,
                role: user.role,
            });
        } else {
            // Create new user
            console.log(`[Google Login] Creating new user: ${email}`);

            // Generate valid random password
            const randomPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name: name || 'Google User',
                email,
                mobile: mobile || undefined, // undefined lets the sparse index work (no value)
                password: hashedPassword,
                isVerified: true, // Trusted provider
                profileImage
            });

            return res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                token: generateToken(user.id),
                isPremium: user.isPremium,
                profileImage: user.profileImage,
                role: user.role,
            });
        }
    } catch (error) {
        console.error('[Google Login Error]:', error);
        res.status(500).json({
            message: error.message || 'Server error during Google Login',
            details: error.toString()
        });
    }
};

// @desc    Delete user account and all data
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all weddings owned by this user
        const weddings = await Wedding.find({ user: userId });
        const weddingIds = weddings.map(w => w._id);

        // Delete all data linked to those weddings
        await Guest.deleteMany({ wedding: { $in: weddingIds } });
        await Expense.deleteMany({ wedding: { $in: weddingIds } });
        await Shagun.deleteMany({ wedding: { $in: weddingIds } });
        await Vendor.deleteMany({ wedding: { $in: weddingIds } });
        await Event.deleteMany({ wedding: { $in: weddingIds } });
        await Task.deleteMany({ wedding: { $in: weddingIds } });
        await ChatHistory.deleteMany({ wedding: { $in: weddingIds } });
        await Payment.deleteMany({ user: userId });

        // Delete weddings
        await Wedding.deleteMany({ user: userId });

        // Remove user from any collaborator lists
        await Wedding.updateMany(
            { collaborators: userId },
            { $pull: { collaborators: userId } }
        );

        // Delete user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const upgradeToPremium = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findByIdAndUpdate(userId, { isPremium: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User upgraded to premium', isPremium: user.isPremium });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -__v');
        if (user) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isPremium: user.isPremium,
                role: user.role,
                profileImage: user.profileImage,
                // Add any other fields needed
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { profileImage, name, email } = req.body;

        const updates = {};
        if (profileImage !== undefined) updates.profileImage = profileImage;
        if (name) updates.name = name;
        // Email update might require verification, skipping for now or allow if not strict.

        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -__v');

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            isPremium: user.isPremium,
            profileImage: user.profileImage,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email: rawEmail } = req.body;
    const email = rawEmail ? rawEmail.toLowerCase() : '';

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log(`\n[Forgot Password] OTP generated for ${email}: ${otp}`);

        // Send OTP via Email
        const message = `You requested a password reset. Your OTP is: ${otp}\n\nIt is valid for 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message: message,
            });
            res.json({ message: 'OTP sent to your email', email: user.email });
        } catch (emailError) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email: rawEmail, otp, newPassword } = req.body;
    const email = rawEmail ? rawEmail.toLowerCase() : '';

    try {
        console.log(`\n--- RESET PASSWORD ATTEMPT ---`);
        console.log(`Email: ${email}`);
        console.log(`Received OTP: [${otp}]`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Error: User not found for ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Stored OTP: [${user.otp}]`);
        console.log(`Stored Expiry: ${user.otpExpires}`);
        console.log(`Current Time: ${Date.now()}`);

        if (!user.otp || !user.otpExpires) {
            console.log(`Error: No OTP or Expiry found in DB for this user`);
            return res.status(400).json({ message: 'Invalid request. Please request a new OTP.' });
        }

        const isMatch = String(user.otp).trim() === String(otp).trim();
        const isExpired = user.otpExpires < Date.now();

        console.log(`Match: ${isMatch}, Expired: ${isExpired}`);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (isExpired) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const tokenPrefix = fcmToken ? fcmToken.substring(0, 10) + '...' : 'NULL';
        const tokenLength = fcmToken ? fcmToken.length : 0;
        console.log(`[FCM] Token Update Request | User: ${req.user.email} | Prefix: ${tokenPrefix} | Length: ${tokenLength}`);
        
        const user = await User.findByIdAndUpdate(req.user._id, { fcmToken }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'FCM Token updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendTestNotification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.fcmToken) {
            return res.status(400).json({ message: 'No FCM token found for this user. Please enable notifications in the app first.' });
        }

        console.log(`[Notification Test] Sending test push to ${user.email}`);
        await sendNotification(
            user.fcmToken,
            'Test Push Notification',
            'This is a test notification from Shagun Wedding Manager. It does not create any events!',
            { type: 'TEST_PUSH' }
        );

        res.json({ message: 'Test notification sent!' });
    } catch (error) {
        console.error('Test Notification Error:', error.message);
        res.status(500).json({ message: 'Failed to send test notification' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyOtp,
    deleteAccount,
    upgradeToPremium,
    getMe,
    updateProfile,
    googleLogin,
    forgotPassword,
    resetPassword,
    updateFcmToken,
    sendTestNotification
};
