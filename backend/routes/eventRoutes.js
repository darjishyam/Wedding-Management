const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect: auth } = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', [auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('weddingId', 'Wedding ID is required').not().isEmpty()
]], eventController.createEvent);

// @route   GET /api/events/:weddingId
// @desc    Get all events for a specific wedding
// @access  Private
router.get('/:weddingId', auth, eventController.getWeddingEvents);

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', auth, eventController.updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
