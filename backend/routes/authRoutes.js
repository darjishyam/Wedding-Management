const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, deleteAccount, upgradeToPremium, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.delete('/delete-account', protect, deleteAccount);
router.post('/upgrade', protect, upgradeToPremium);
router.get('/me', protect, getMe);

module.exports = router;
