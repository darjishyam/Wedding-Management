const Expense = require('../models/Expense');
const Wedding = require('../models/Wedding');

// @desc    Add an expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    const { title, amount, category, date, weddingId } = req.body;

    try {
        let wedding;
        if (weddingId) {
            wedding = await Wedding.findOne({ _id: weddingId, user: req.user._id });
        } else {
            wedding = await Wedding.findOne({ user: req.user._id });
        }

        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }

        const expense = await Expense.create({
            wedding: wedding._id,
            title,
            amount,
            paidAmount: req.body.paidAmount || 0,
            category,
            date,
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all expenses for a wedding
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        let weddingId = req.query.weddingId;

        if (!weddingId) {
            const wedding = await Wedding.findOne({ user: req.user._id });
            if (!wedding) return res.json([]);
            weddingId = wedding._id;
        } else {
            const wedding = await Wedding.findOne({ _id: weddingId, user: req.user._id });
            if (!wedding) return res.status(404).json({ message: 'Wedding not found' });
        }

        const expenses = await Expense.find({ wedding: weddingId });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addExpense, getExpenses };
