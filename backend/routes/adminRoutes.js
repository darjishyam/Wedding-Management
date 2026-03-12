const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, deleteUserByAdmin, getAllWeddings, deleteWeddingByAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getSystemStats);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUserByAdmin);
router.get('/weddings', protect, admin, getAllWeddings);
router.delete('/weddings/:id', protect, admin, deleteWeddingByAdmin);

module.exports = router;
