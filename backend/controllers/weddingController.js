const Wedding = require('../models/Wedding');
const Guest = require('../models/Guest');
const Expense = require('../models/Expense');
const Package = require('../models/Package');
const Vendor = require('../models/Vendor');
const Shagun = require('../models/Shagun');

// @desc    Create a new wedding
// @route   POST /api/weddings
// @access  Private
const createWedding = async (req, res) => {
    const {
        groomName, brideName, date, packageId
    } = req.body;

    try {
        const wedding = await Wedding.create({
            user: req.user._id,
            groomName,
            brideName,
            groomImage: req.body.groomImage,
            brideImage: req.body.brideImage,
            date,
            type: req.body.type || 'Traditional',
            location: req.body.location,
            venue: req.body.venue
        });

        if (packageId) {
            const pkg = await Package.findById(packageId);
            if (pkg) {
                // Update wedding financials based on package
                // We don't overwrite user inputs if they existed, but here we only took basic inputs.
                // So we can set defaults from package.

                wedding.totalBudget = pkg.totalPrice || 0;
                wedding.location = pkg.location;
                wedding.venue = pkg.venue;
                wedding.totalBudget = pkg.totalPrice;

                await wedding.save();

                // Create expenses based on package (EXCLUDING Shagun)
                const expensesToCreate = [];
                const { catering, decoration, stay, venue } = pkg.items || {};

                if (catering > 0) expensesToCreate.push({ title: 'Catering Package', amount: catering, category: 'Catering' });
                if (decoration > 0) expensesToCreate.push({ title: 'Decoration Package', amount: decoration, category: 'Decoration' });
                if (stay > 0) expensesToCreate.push({ title: 'Stay/Hotel', amount: stay, category: 'Stay' });

                // If venue cost is separate in items, add it. If 0, assume included in package price but maybe track it?
                // Let's add it if > 0.
                if (venue > 0) expensesToCreate.push({ title: `Venue: ${pkg.venue || 'Package Venue'}`, amount: venue, category: 'Venue' });

                if (expensesToCreate.length > 0) {
                    const finalExpenseDocs = expensesToCreate.map(exp => ({
                        wedding: wedding._id,
                        title: exp.title,
                        amount: exp.amount,
                        category: exp.category,
                        date: new Date(),
                    }));
                    await Expense.insertMany(finalExpenseDocs);
                    await Expense.insertMany(finalExpenseDocs);
                }

                // Create VENDORS based on package items
                const vendorsToCreate = [];
                if (catering > 0) vendorsToCreate.push({ name: 'Package Catering Service', category: 'Catering', totalAmount: catering, status: 'Pending' });
                if (decoration > 0) vendorsToCreate.push({ name: 'Package Decorator', category: 'Decoration', totalAmount: decoration, status: 'Pending' });
                if (stay > 0) vendorsToCreate.push({ name: 'Venue Stay Manager', category: 'Venue', totalAmount: stay, status: 'Pending' });
                if (venue > 0) vendorsToCreate.push({ name: 'Venue Manager', category: 'Venue', totalAmount: venue, status: 'Pending' });

                if (vendorsToCreate.length > 0) {
                    const finalVendorDocs = vendorsToCreate.map(v => ({
                        wedding: wedding._id,
                        name: v.name,
                        category: v.category,
                        totalAmount: v.totalAmount,
                        status: v.status,
                        paidAmount: 0
                    }));
                    await Vendor.insertMany(finalVendorDocs);
                }
            }
        }

        res.status(201).json(wedding);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all weddings for user
// @route   GET /api/weddings
// @access  Private
const getAllWeddings = async (req, res) => {
    try {
        const weddings = await Wedding.find({ user: req.user._id }).sort({ date: -1 });
        res.json(weddings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's wedding with stats (latest or specific)
// @route   GET /api/weddings/my
// @access  Private
const getMyWedding = async (req, res) => {
    try {
        let wedding;
        const { weddingId } = req.query;

        if (weddingId) {
            wedding = await Wedding.findOne({ _id: weddingId, user: req.user._id });
        } else {
            // Default to the most recently created/updated or just one
            // We'll sort by createdAt desc to get the latest
            wedding = await Wedding.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        }

        if (wedding) {
            // Fetch stats in parallel
            const guestCount = await Guest.countDocuments({ wedding: wedding._id });

            // Calculate expenses
            const expenses = await Expense.find({ wedding: wedding._id });
            const totalSpentAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

            // Calculate Shagun (Income)
            // Note: Shagun amount is stored as String in schema? Let's check. 
            // If stored as string "500", we need casting. Assuming we fix schema or cast here.
            // Ideally Shagun schema should have Number. 
            const shaguns = await Shagun.find({ wedding: wedding._id });
            const totalShagunAmount = shaguns.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

            // Net Balance = (Budget + Income) - Spent
            // OR Simple Balance = Budget - Spent (with Shagun shown separately as Income)
            // Let's provide Net Balance as purely cashflow:
            const netBalance = (wedding.totalBudget || 0) + totalShagunAmount - totalSpentAmount;

            res.json({
                ...wedding.toObject(),
                startStatistics: {
                    guestCount,
                    totalSpent: totalSpentAmount,
                    totalShagun: totalShagunAmount,
                    netBalance: netBalance,
                    status: wedding.status // Ensure status is sent
                }
            });
        } else {
            res.status(404).json({ message: 'Wedding not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update wedding details
// @route   PUT /api/weddings/:id
// @access  Private
const updateWedding = async (req, res) => {
    try {
        const { groomName, brideName, date, totalBudget } = req.body;
        const wedding = await Wedding.findOne({ _id: req.params.id, user: req.user._id });

        if (wedding) {
            wedding.groomName = groomName || wedding.groomName;
            wedding.brideName = brideName || wedding.brideName;
            wedding.date = date || wedding.date;
            if (totalBudget !== undefined) wedding.totalBudget = totalBudget;

            // Update individual budgets if provided
            if (req.body.catering !== undefined) wedding.catering = req.body.catering;
            if (req.body.decoration !== undefined) wedding.decoration = req.body.decoration;
            if (req.body.stay !== undefined) wedding.stay = req.body.stay;
            if (req.body.photography !== undefined) wedding.photography = req.body.photography;
            if (req.body.travel !== undefined) wedding.travel = req.body.travel;
            if (req.body.makeup !== undefined) wedding.makeup = req.body.makeup;
            if (req.body.otherExpenses !== undefined) wedding.otherExpenses = req.body.otherExpenses;

            if (req.body.type) wedding.type = req.body.type;
            if (req.body.location) wedding.location = req.body.location;
            if (req.body.venue) wedding.venue = req.body.venue;
            if (req.body.groomImage !== undefined) wedding.groomImage = req.body.groomImage;
            if (req.body.brideImage !== undefined) wedding.brideImage = req.body.brideImage;

            const updatedWedding = await wedding.save();
            res.json(updatedWedding);
        } else {
            res.status(404).json({ message: 'Wedding not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createWedding, getMyWedding, getAllWeddings, updateWedding };
