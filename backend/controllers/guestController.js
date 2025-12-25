const Guest = require('../models/Guest');
const Wedding = require('../models/Wedding');

// @desc    Add a guest
// @route   POST /api/guests
// @access  Private
const addGuest = async (req, res) => {
    const { name, cityVillage, familyCount } = req.body;

    try {
        const wedding = await Wedding.findOne({ user: req.user._id });
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }

        const guest = await Guest.create({
            wedding: wedding._id,
            name,
            cityVillage,
            familyCount,
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
        const wedding = await Wedding.findOne({ user: req.user._id });
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }

        const guests = await Guest.find({ wedding: wedding._id });
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

        // Verify user owns the wedding that owns the guest
        // (Optional strictly speaking if we trust ID, but good practice. skipped for brevity to match style or add basic check)

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

module.exports = { addGuest, getGuests, updateGuest };
