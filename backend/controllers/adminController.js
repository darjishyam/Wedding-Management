const User = require('../models/User');
const Wedding = require('../models/Wedding');
const Vendor = require('../models/Vendor');
const Package = require('../models/Package');

// @desc    Get System-wide Statistics
// @route   GET /api/admin/stats
// @access  Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalWeddings = await Wedding.countDocuments({});
        const totalPremium = await User.countDocuments({ isPremium: true });
        const totalVendors = await Vendor.countDocuments({});
        const totalPackages = await Package.countDocuments({});

        // Get revenue (Total Paid to Vendors across system - purely indicative)
        // Or maybe total expenses tracked? Let's stick to objects count.

        res.json({
            users: totalUsers,
            weddings: totalWeddings,
            premiumUsers: totalPremium,
            vendors: totalVendors,
            packages: totalPackages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Users with their Wedding info
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        // This might be slow if users > 1000, but fine for MVP
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a User (Admin Override)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUserByAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        await Wedding.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted by Admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSystemStats, getAllUsers, deleteUserByAdmin };
