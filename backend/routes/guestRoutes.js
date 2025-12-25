const express = require('express');
const router = express.Router();
const { addGuest, getGuests, updateGuest } = require('../controllers/guestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addGuest);
router.get('/', protect, getGuests);
router.put('/:id', protect, updateGuest);

module.exports = router;
