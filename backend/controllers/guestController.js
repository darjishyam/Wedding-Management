const Guest = require('../models/Guest');
const Wedding = require('../models/Wedding');
const crypto = require('crypto');

// @desc    Add a guest
// @route   POST /api/guests
// @access  Private
const addGuest = async (req, res) => {
    const { name, cityVillage, familyCount, category, status, assignedEvents, weddingId } = req.body;

    try {
        let wedding;
        if (weddingId) {
            wedding = await Wedding.findOne({ _id: weddingId, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        } else {
            wedding = await Wedding.findOne({ $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        }

        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }

        const rsvpToken = crypto.randomBytes(8).toString('hex');

        const guest = await Guest.create({
            wedding: wedding._id,
            name,
            cityVillage,
            familyCount,
            category: category || 'Other',
            status: status || 'Not Invited',
            assignedEvents: assignedEvents || [],
            rsvpToken
        });

        res.status(201).json(guest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all guests for a wedding
// @route   GET /api/guests
// @access  Private
const getGuests = async (req, res) => {
    try {
        let weddingId = req.query.weddingId;

        if (!weddingId) {
            const wedding = await Wedding.findOne({ $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) return res.json([]);
            weddingId = wedding._id;
        } else {
            // Verify ownership or collaborator access
            const wedding = await Wedding.findOne({ _id: weddingId, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) return res.status(404).json({ message: 'Wedding not found' });
        }

        const guests = await Guest.find({ wedding: weddingId });
        res.json(guests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a guest
// @route   PUT /api/guests/:id
// @access  Private
const updateGuest = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);

        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        // Verify ownership or collaborator access
        const wedding = await Wedding.findOne({ _id: guest.wedding, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized to update this guest' });
        }

        const updatedGuest = await Guest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedGuest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a guest
// @route   DELETE /api/guests/:id
// @access  Private
const deleteGuest = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);

        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        // Verify ownership or collaborator access
        const wedding = await Wedding.findOne({ _id: guest.wedding, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized to delete this guest' });
        }

        await guest.deleteOne();
        res.json({ message: 'Guest removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get guest by token (Public)
// @route   GET /api/guests/rsvp/:token
// @access  Public
const getGuestByToken = async (req, res) => {
    try {
        const guest = await Guest.findOne({ rsvpToken: req.params.token }).populate({
            path: 'wedding',
            select: 'brideName groomName date venue location brideImage groomImage'
        });

        if (!guest) {
            return res.status(404).json({ message: 'Invalid RSVP token' });
        }

        res.json(guest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit RSVP (Public)
// @route   POST /api/guests/rsvp/:token
// @access  Public
const submitRSVP = async (req, res) => {
    const { token } = req.params;
    const { status, attendanceCount, foodPreference } = req.body;

    try {
        const guest = await Guest.findOne({ rsvpToken: token });

        if (!guest) {
            return res.status(404).json({ message: 'Invalid RSVP token' });
        }

        guest.status = status || 'Confirmed';
        guest.attendanceCount = attendanceCount || guest.familyCount;
        guest.foodPreference = foodPreference || 'Veg';

        await guest.save();

        res.json({ message: 'RSVP submitted successfully', guest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addGuest, getGuests, updateGuest, deleteGuest, submitRSVP, getGuestByToken };
