const Vendor = require('../models/Vendor');
const Wedding = require('../models/Wedding');

// @desc    Add a vendor
// @route   POST /api/vendors
// @access  Private
const addVendor = async (req, res) => {
    const { name, category, contact, totalAmount, paidAmount } = req.body;

    try {
        const wedding = await Wedding.findOne({ user: req.user._id });
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }

        // Calculate status automatically
        let status = 'Pending';
        if (paidAmount >= totalAmount && totalAmount > 0) {
            status = 'Paid';
        } else if (paidAmount > 0) {
            status = 'Partial';
        }

        const vendor = await Vendor.create({
            wedding: wedding._id,
            name,
            category,
            contact,
            totalAmount: Number(totalAmount) || 0,
            paidAmount: Number(paidAmount) || 0,
            status
        });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all vendors for a wedding
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res) => {
    try {
        const wedding = await Wedding.findOne({ user: req.user._id });
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found' });
        }

        const vendors = await Vendor.find({ wedding: wedding._id }).sort({ createdAt: -1 });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a vendor
// @route   PUT /api/vendors/:id
// @access  Private
const updateVendor = async (req, res) => {
    try {
        const { name, category, contact, totalAmount, paidAmount } = req.body;

        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if user owns the wedding
        const wedding = await Wedding.findOne({ _id: vendor.wedding, user: req.user._id });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Recalculate status if amounts change
        let status = vendor.status;
        const newTotal = totalAmount !== undefined ? Number(totalAmount) : vendor.totalAmount;
        const newPaid = paidAmount !== undefined ? Number(paidAmount) : vendor.paidAmount;

        if (newPaid >= newTotal && newTotal > 0) {
            status = 'Paid';
        } else if (newPaid > 0) {
            status = 'Partial';
        } else {
            status = 'Pending';
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            {
                name,
                category,
                contact,
                totalAmount: newTotal,
                paidAmount: newPaid,
                status
            },
            { new: true }
        );

        res.json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
// @access  Private
const deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if user owns the wedding
        const wedding = await Wedding.findOne({ _id: vendor.wedding, user: req.user._id });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await vendor.deleteOne();
        res.json({ message: 'Vendor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a payment to vendor
// @route   POST /api/vendors/:id/payment
// @access  Private
const addPayment = async (req, res) => {
    try {
        const { amount, mode, note, date } = req.body;
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Auth Check
        const wedding = await Wedding.findOne({ _id: vendor.wedding, user: req.user._id });
        if (!wedding) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Add Payment
        vendor.payments.push({
            amount: Number(amount),
            mode: mode || 'Cash',
            note,
            date: date || Date.now()
        });

        // Recalculate Totals
        const totalPaid = vendor.payments.reduce((sum, p) => sum + p.amount, 0);
        vendor.paidAmount = totalPaid;

        // Update Status
        if (vendor.paidAmount >= vendor.totalAmount && vendor.totalAmount > 0) {
            vendor.status = 'Paid';
        } else if (vendor.paidAmount > 0) {
            vendor.status = 'Partial';
        } else {
            vendor.status = 'Pending';
        }

        await vendor.save();
        res.json(vendor);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addVendor, getVendors, updateVendor, deleteVendor, addPayment };
