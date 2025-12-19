const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
