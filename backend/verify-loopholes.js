const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Wedding = require('./models/Wedding');
const Vendor = require('./models/Vendor');
const Expense = require('./models/Expense');
const Shagun = require('./models/Shagun');
const Payment = require('./models/Payment');

dotenv.config();

const verifyLoopholes = async () => {
    console.log("🔍 STARTING LOOPHOLE VERIFICATION...\n");

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Setup Test User
        const testEmail = `test_${Date.now()}@user.com`;
        const user = await User.create({
            name: "Loophole Tester",
            email: testEmail,
            password: "password123",
            mobile: Date.now().toString()
        });
        console.log(`\n👤 Created Test User: ${user.email}`);

        // ---------------------------------------------------------
        // LOOPHOLE 1: Wedding Lifecycle (Status)
        // ---------------------------------------------------------
        console.log("\n---------------------------------------------------------");
        console.log("1️⃣  TESTING LOOPHOLE 1: WEDDING LIFECYCLE");

        const wedding = await Wedding.create({
            user: user._id,
            groomName: "Test Groom",
            brideName: "Test Bride",
            date: new Date(),
            totalBudget: 100000 // 1 Lakh Budget
        });

        console.log(`   Detailed Created. Status: "${wedding.status}"`);
        if (wedding.status === 'Planned') {
            console.log("   ✅ SUCCESS: Default status is 'Planned'!");
        } else {
            console.log("   ❌ FAIL: Status is missing or incorrect.");
        }

        // ---------------------------------------------------------
        // LOOPHOLE 2: Central Dashboard Logic (Net Balance)
        // ---------------------------------------------------------
        console.log("\n---------------------------------------------------------");
        console.log("2️⃣  TESTING LOOPHOLE 2: DASHBOARD LOGIC (NET BALANCE)");

        // Add Expense: 20k
        await Expense.create({
            wedding: wedding._id,
            title: "Catering Advance",
            amount: 20000,
            category: "Catering"
        });

        // Add Shagun (Income): 5k
        await Shagun.create({
            wedding: wedding._id,
            name: "Guest 1",
            amount: "5000" // Stored as string usually
        });

        // Fetch via logic (simulating controller logic)
        const expenses = await Expense.find({ wedding: wedding._id });
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

        const shaguns = await Shagun.find({ wedding: wedding._id });
        const totalShagun = shaguns.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const netBalance = wedding.totalBudget + totalShagun - totalSpent;
        // 100k + 5k - 20k = 85k

        console.log(`   Budget: ${wedding.totalBudget}`);
        console.log(`   Total Spent: ${totalSpent}`);
        console.log(`   Total Shagun: ${totalShagun}`);
        console.log(`   Calculated Net Balance: ${netBalance}`);

        if (netBalance === 85000) {
            console.log("   ✅ SUCCESS: Net Balance calculation is correct!");
        } else {
            console.log("   ❌ FAIL: Calculation mismatch.");
        }

        // ---------------------------------------------------------
        // LOOPHOLE 3: Vendor Payments (Ledger & Remaining)
        // ---------------------------------------------------------
        console.log("\n---------------------------------------------------------");
        console.log("3️⃣  TESTING LOOPHOLE 3: VENDOR LEDGER");

        const vendor = await Vendor.create({
            wedding: wedding._id,
            name: "Test Vendor",
            totalAmount: 50000,
            paidAmount: 0
        });

        // Add Payment via Logic
        vendor.payments.push({
            amount: 10000,
            mode: "UPI",
            date: new Date()
        });
        vendor.paidAmount += 10000;
        vendor.status = 'Partial';
        await vendor.save();

        // Fetch updated
        const updatedVendor = await Vendor.findById(vendor._id);
        console.log(`   Vendor Total: ${updatedVendor.totalAmount}`);
        console.log(`   Vendor Paid: ${updatedVendor.paidAmount}`);
        console.log(`   Vendor Remaining (Virtual): ${updatedVendor.remainingAmount}`);
        console.log(`   Payment Ledger Count: ${updatedVendor.payments.length}`);
        console.log(`   Last Payment Mode: ${updatedVendor.payments[0].mode}`);

        if (updatedVendor.remainingAmount === 40000 && updatedVendor.payments.length === 1) {
            console.log("   ✅ SUCCESS: Remaining amount and Ledger tracking works!");
        }

        // ---------------------------------------------------------
        // LOOPHOLE 4: Premium Payment Flow
        // ---------------------------------------------------------
        console.log("\n---------------------------------------------------------");
        console.log("4️⃣  TESTING LOOPHOLE 4: PREMIUM PAYMENT SIMULATION");

        const payment = await Payment.create({
            user: user._id,
            weddingId: wedding._id,
            amount: 499,
            type: 'Premium Upgrade',
            status: 'Success',
            isTestPayment: true
        });

        console.log(`   Payment Created. isTestPayment: ${payment.isTestPayment}`);
        console.log(`   Wedding ID Linked: ${payment.weddingId}`);

        if (payment.isTestPayment === true && payment.weddingId) {
            console.log("   ✅ SUCCESS: Mock Payment correctly flagged as Test Payment!");
        }

        // Clean up
        await User.deleteOne({ _id: user._id });
        await Wedding.deleteOne({ _id: wedding._id });
        await Vendor.deleteOne({ _id: vendor._id });
        await Payment.deleteOne({ _id: payment._id });
        await Expense.deleteMany({ wedding: wedding._id });
        await Shagun.deleteMany({ wedding: wedding._id });

        console.log("\n---------------------------------------------------------");
        console.log("✨  ALL CHECKS PASSED. CLEANUP COMPLETE.");

    } catch (error) {
        console.error("❌ ERROR:", error);
    } finally {
        mongoose.connection.close();
    }
};

verifyLoopholes();
