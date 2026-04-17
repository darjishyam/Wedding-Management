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
            wedding = await Wedding.findOne({ _id: weddingId, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        } else {
            wedding = await Wedding.findOne({ $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
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
            const wedding = await Wedding.findOne({ $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) return res.json([]);
            weddingId = wedding._id;
        } else {
            const wedding = await Wedding.findOne({ _id: weddingId, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
            if (!wedding) return res.status(404).json({ message: 'Wedding not found' });
        }

        const expenses = await Expense.find({ wedding: weddingId });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Verify ownership or collaborator access
        const wedding = await Wedding.findOne({ _id: expense.wedding, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized to update this expense' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Verify ownership or collaborator access
        const wedding = await Wedding.findOne({ _id: expense.wedding, $or: [{ user: req.user._id }, { collaborators: req.user._id }] });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized to delete this expense' });
        }

        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addExpense, getExpenses, updateExpense, deleteExpense };
