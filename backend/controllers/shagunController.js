const Shagun = require('../models/Shagun');
const Wedding = require('../models/Wedding');

// @desc    Get all shagun entries for a wedding
// @route   GET /api/shagun
// @access  Private
const getShaguns = async (req, res) => {
    try {
        let weddingId = req.query.weddingId;

        // Validation or fallback
        if (!weddingId) {
            const wedding = await Wedding.findOne({ $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) {
                return res.status(404).json({ message: 'Wedding not found' });
            }
            weddingId = wedding._id;
        } else {
            // Verify this wedding belongs to the user or they are a collaborator
            const wedding = await Wedding.findOne({ _id: weddingId, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) {
                return res.status(404).json({ message: 'Wedding not found or access denied' });
            }
        }

        const shaguns = await Shagun.find({ wedding: weddingId }).sort({ date: -1 });
        res.json(shaguns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a shagun entry
// @route   POST /api/shagun
// @access  Private
const addShagun = async (req, res) => {
    try {
        let weddingId = req.body.weddingId;

        if (!weddingId) {
            const wedding = await Wedding.findOne({ $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) {
                return res.status(404).json({ message: 'Wedding not found' });
            }
            weddingId = wedding._id;
        } else {
            // Verify ownership or collaborator access
            const wedding = await Wedding.findOne({ _id: weddingId, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) {
                return res.status(404).json({ message: 'Wedding not found or access denied' });
            }
        }

        const { name, amount, city, gift, contact, wishes, date } = req.body;

        // Strip non-numeric chars if passed as string (e.g. "₹ 500")
        const numericAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, ''));

        const shagun = new Shagun({
            wedding: weddingId,
            name,
            amount: numericAmount,
            city,
            gift,
            contact,
            wishes,
            date: date || Date.now()
        });

        const createdShagun = await shagun.save();
        res.status(201).json(createdShagun);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a shagun entry
// @route   DELETE /api/shagun/:id
// @access  Private
const deleteShagun = async (req, res) => {
    try {
        const shagun = await Shagun.findById(req.params.id);

        if (!shagun) {
            return res.status(404).json({ message: 'Shagun not found' });
        }

        // Verify ownership or collaborator access
        const wedding = await Wedding.findOne({ _id: shagun.wedding, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized to delete this shagun' });
        }

        await shagun.deleteOne();
        res.json({ message: 'Shagun removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getShaguns, addShagun, deleteShagun };
