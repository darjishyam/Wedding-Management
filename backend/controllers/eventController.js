const Event = require('../models/Event');
const Wedding = require('../models/Wedding');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        const { weddingId, name, date, time, venue, description, itinerary } = req.body;

        // Verify wedding belongs to user or they are a collaborator
        const wedding = await Wedding.findOne({
            _id: weddingId,
            $or: [{ user: req.user._id }, { collaborators: req.user._id }]
        });
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found or not authorized' });
        }

        const event = new Event({
            wedding: weddingId,
            name,
            date,
            time,
            venue,
            description,
            itinerary
        });

        const savedEvent = await event.save();

        // Optional: Add to wedding's event array if you want bidirectional linking
        wedding.events.push(savedEvent._id);
        await wedding.save();

        res.status(201).json(savedEvent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all events for a wedding
// @route   GET /api/events/:weddingId
// @access  Private
exports.getWeddingEvents = async (req, res) => {
    try {
        const events = await Event.find({ wedding: req.params.weddingId }).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
    try {
        const { name, date, time, venue, description, status, itinerary } = req.body;

        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Verify ownership or collaborator access
        const wedding = await Wedding.findOne({
            _id: event.wedding,
            $or: [{ user: req.user._id }, { collaborators: req.user._id }]
        });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        if (name) event.name = name;
        if (date) event.date = date;
        if (time) event.time = time;
        if (venue) event.venue = venue;
        if (description) event.description = description;
        if (status) event.status = status;
        if (itinerary) event.itinerary = itinerary;

        await event.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if wedding exists and user has access
        const wedding = await Wedding.findOne({
            _id: event.wedding,
            $or: [{ user: req.user._id }, { collaborators: req.user._id }]
        });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();

        // Remove from wedding array
        wedding.events = wedding.events.filter(e => e.toString() !== req.params.id);
        await wedding.save();

        res.json({ message: 'Event removed' });
    } catch (err) {
        console.error('Delete Event Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
