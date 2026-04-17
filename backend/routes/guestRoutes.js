const express = require('express');
const router = express.Router();
const { addGuest, getGuests, updateGuest, deleteGuest, submitRSVP, getGuestByToken } = require('../controllers/guestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/rsvp/:token', getGuestByToken); // Public route - Get guest info by RSVP token
router.post('/rsvp/:token', submitRSVP); // Public route - Submit RSVP response
router.post('/', protect, addGuest);
router.get('/', protect, getGuests);
router.put('/:id', protect, updateGuest);
router.delete('/:id', protect, deleteGuest);

module.exports = router;
