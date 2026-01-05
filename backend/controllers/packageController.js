const Package = require('../models/Package');

// @desc    Create a new package
// @route   POST /api/packages
// @access  Admin
const createPackage = async (req, res) => {
    try {
        const { name, type, location, venue, description, totalPrice, catering, decoration, stay, image } = req.body;

        const pkg = await Package.create({
            name,
            type,
            location,
            venue,
            description,
            totalPrice,
            items: {
                catering: Number(catering) || 0,
                decoration: Number(decoration) || 0,
                stay: Number(stay) || 0,
                venue: 0
            },
            image
        });

        res.status(201).json(pkg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPackage, getPackages };
