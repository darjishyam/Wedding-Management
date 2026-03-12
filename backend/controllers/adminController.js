const User = require('../models/User');
const Wedding = require('../models/Wedding');
const Vendor = require('../models/Vendor');
const Package = require('../models/Package');
const Payment = require('../models/Payment');

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

        // Calculate Revenue
        const payments = await Payment.aggregate([
            { $match: { status: 'Success', isTestPayment: { $ne: true } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = payments.length > 0 ? payments[0].total : 0;

        res.json({
            users: totalUsers,
            weddings: totalWeddings,
            premiumUsers: totalPremium,
            vendors: totalVendors,
            packages: totalPackages,
            revenue: totalRevenue // Added Revenue
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

// @desc    Get All Weddings
// @route   GET /api/admin/weddings
// @access  Admin
const getAllWeddings = async (req, res) => {
    try {
        const weddings = await Wedding.find({})
            .populate('user', 'name email')
            .sort({ date: 1 });
        res.json(weddings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a Wedding
// @route   DELETE /api/admin/weddings/:id
// @access  Admin
const deleteWeddingByAdmin = async (req, res) => {
    try {
        const weddingId = req.params.id;
        // Delete related data first (optional but good practice)
        // For minimal redundancy, we just delete the wedding doc, assuming cascade is handled or acceptable.
        // But let's keep it simple: just delete the wedding.
        await Wedding.findByIdAndDelete(weddingId);
        res.json({ message: 'Wedding deleted by Admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    deleteUserByAdmin,
    getAllWeddings,
    deleteWeddingByAdmin
};
