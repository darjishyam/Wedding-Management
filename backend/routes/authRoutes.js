const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, deleteAccount, upgradeToPremium, getMe, updateProfile, googleLogin, forgotPassword, resetPassword, updateFcmToken, sendTestNotification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/delete-account', protect, deleteAccount);
router.post('/upgrade', protect, upgradeToPremium);
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);
router.put('/fcm-token', protect, updateFcmToken);
router.post('/test-notification', protect, sendTestNotification);

module.exports = router;
