const Event = require('../models/Event');
const Wedding = require('../models/Wedding');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        const { weddingId, name, date, time, venue, description } = req.body;

        // Verify wedding belongs to user
        const wedding = await Wedding.findById(weddingId);
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }
        if (wedding.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const event = new Event({
            wedding: weddingId,
            name,
            date,
            time,
            venue,
            description
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
        const { name, date, time, venue, description, status } = req.body;

        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Verify ownership via wedding check
        const wedding = await Wedding.findById(event.wedding);
        if (wedding.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        if (name) event.name = name;
        if (date) event.date = date;
        if (time) event.time = time;
        if (venue) event.venue = venue;
        if (description) event.description = description;
        if (status) event.status = status;

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
    console.log(`\n[DELETE EVENT] Request received for ID: ${req.params.id}`);
    console.log(`[DELETE EVENT] User ID from token: ${req.user ? req.user._id : 'Unknown'}`);

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            console.log(`[DELETE EVENT] Event not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log(`[DELETE EVENT] Event found: ${event.name} (Wedding ID: ${event.wedding})`);

        // Check if wedding exists
        const wedding = await Wedding.findById(event.wedding);
        if (!wedding) {
            console.log(`[DELETE EVENT] CRITICAL: Associated wedding ${event.wedding} not found.`);
            // If wedding is missing, should we allow delete? 
            // Ideally yes to clean up, but we can't verify ownership. 
            // For now, let's allow it if we are desperate or block it. 
            // Blocking is safer for now to avoid unauthorized random deletes if ID guessed.
            return res.status(404).json({ message: 'Associated wedding not found, cannot verify ownership' });
        }

        console.log(`[DELETE EVENT] Wedding found. Owner: ${wedding.user.toString()}`);

        if (wedding.user.toString() !== req.user.id) {
            console.log(`[DELETE EVENT] Authorization Failed. Wedding Owner: ${wedding.user.toString()}, Request User: ${req.user.id}`);
            return res.status(401).json({ message: `Not authorized. Owner: ${wedding.user.toString()}, You: ${req.user.id}` });
        }

        await event.deleteOne();
        console.log(`[DELETE EVENT] Event deleted from Events collection.`);

        // Remove from wedding array
        const initialCount = wedding.events.length;
        wedding.events = wedding.events.filter(e => e.toString() !== req.params.id);

        if (wedding.events.length !== initialCount) {
            console.log(`[DELETE EVENT] Removed event from Wedding event list.`);
        } else {
            console.log(`[DELETE EVENT] Event ID was not found in Wedding's event list (inconsistency?).`);
        }

        await wedding.save();
        console.log(`[DELETE EVENT] Wedding saved.`);

        res.json({ message: 'Event removed' });
    } catch (err) {
        console.error(`[DELETE EVENT] ERROR: ${err.message}`);
        console.error(err);
        res.status(500).json({ message: `Server Error: ${err.message}` });
    }
};
