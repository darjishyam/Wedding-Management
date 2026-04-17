const User = require('../models/User');
const Wedding = require('../models/Wedding');
const Vendor = require('../models/Vendor');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Guest = require('../models/Guest');
const Expense = require('../models/Expense');
const Shagun = require('../models/Shagun');
const Event = require('../models/Event');
const Task = require('../models/Task');
const ChatHistory = require('../models/ChatHistory');

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

        // Find all weddings owned by this user
        const weddings = await Wedding.find({ user: userId });
        const weddingIds = weddings.map(w => w._id);

        // Cascade delete all related data
        await Guest.deleteMany({ wedding: { $in: weddingIds } });
        await Expense.deleteMany({ wedding: { $in: weddingIds } });
        await Shagun.deleteMany({ wedding: { $in: weddingIds } });
        await Vendor.deleteMany({ wedding: { $in: weddingIds } });
        await Event.deleteMany({ wedding: { $in: weddingIds } });
        await Task.deleteMany({ wedding: { $in: weddingIds } });
        await ChatHistory.deleteMany({ wedding: { $in: weddingIds } });
        await Payment.deleteMany({ user: userId });

        await Wedding.deleteMany({ user: userId });

        // Remove from collaborator lists
        await Wedding.updateMany(
            { collaborators: userId },
            { $pull: { collaborators: userId } }
        );

        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and all associated data deleted by Admin' });
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

        // Cascade delete all related data
        await Guest.deleteMany({ wedding: weddingId });
        await Expense.deleteMany({ wedding: weddingId });
        await Shagun.deleteMany({ wedding: weddingId });
        await Vendor.deleteMany({ wedding: weddingId });
        await Event.deleteMany({ wedding: weddingId });
        await Task.deleteMany({ wedding: weddingId });
        await ChatHistory.deleteMany({ wedding: weddingId });

        await Wedding.findByIdAndDelete(weddingId);
        res.json({ message: 'Wedding and all associated data deleted by Admin' });
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
