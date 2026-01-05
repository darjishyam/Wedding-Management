const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, deleteUserByAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getSystemStats);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUserByAdmin);

module.exports = router;
