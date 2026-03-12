const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Wedding = require('./models/Wedding');
const Shagun = require('./models/Shagun');
const Guest = require('./models/Guest');
const Expense = require('./models/Expense');
const Task = require('./models/Task');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vedantbhavsar65:vedant@cluster0.t6in1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const runTest = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Create Test User
        const uniqueMobile = `999${Date.now().toString().slice(-7)}`;
        const user = await User.create({
            name: 'Isolation Test User',
            email: `isolation_test_${Date.now()}@example.com`,
            password: 'password123',
            mobile: uniqueMobile
        });
        console.log(`User created: ${user._id}`);

        // 2. Create Two Weddings
        const wedding1 = await Wedding.create({
            user: user._id,
            brideName: 'Bride 1',
            groomName: 'Groom 1',
            date: new Date(),
            type: 'Type 1',
            totalBudget: 100000
        });
        console.log(`Wedding 1 created: ${wedding1._id}`);

        const wedding2 = await Wedding.create({
            user: user._id,
            brideName: 'Bride 2',
            groomName: 'Groom 2',
            date: new Date(),
            type: 'Type 2',
            totalBudget: 200000
        });
        console.log(`Wedding 2 created: ${wedding2._id}`);

        // 3. Add Data to Wedding 1
        await Shagun.create({ wedding: wedding1._id, name: 'Shagun W1', amount: 101, type: 'received', date: new Date() });
        await Guest.create({ wedding: wedding1._id, name: 'Guest W1', familyCount: 2, cityVillage: 'City 1', isInvited: true, shagunAmount: 0 });
        await Expense.create({ wedding: wedding1._id, title: 'Expense W1', amount: 500, category: 'Food', date: new Date() });
        await Task.create({ wedding: wedding1._id, title: 'Task W1', category: 'Other', isCompleted: false });
        console.log('Added data to Wedding 1');

        // 4. Add Data to Wedding 2
        await Shagun.create({ wedding: wedding2._id, name: 'Shagun W2', amount: 501, type: 'received', date: new Date() });
        await Guest.create({ wedding: wedding2._id, name: 'Guest W2', familyCount: 4, cityVillage: 'City 2', isInvited: true, shagunAmount: 0 });
        await Expense.create({ wedding: wedding2._id, title: 'Expense W2', amount: 1000, category: 'Venue', date: new Date() });
        await Task.create({ wedding: wedding2._id, title: 'Task W2', category: 'Venue', isCompleted: false });
        console.log('Added data to Wedding 2');

        // 5. Verify Isolation - Fetch for Wedding 1
        const shaguns1 = await Shagun.find({ wedding: wedding1._id });
        const guests1 = await Guest.find({ wedding: wedding1._id });
        const expenses1 = await Expense.find({ wedding: wedding1._id });
        const tasks1 = await Task.find({ wedding: wedding1._id });

        console.log('\n--- VERIFICATION WEDDING 1 ---');
        console.log(`Shaguns: ${shaguns1.length} (Expected: 1) - ${shaguns1[0].name === 'Shagun W1' ? 'PASS' : 'FAIL'}`);
        console.log(`Guests: ${guests1.length} (Expected: 1) - ${guests1[0].name === 'Guest W1' ? 'PASS' : 'FAIL'}`);
        console.log(`Expenses: ${expenses1.length} (Expected: 1) - ${expenses1[0].title === 'Expense W1' ? 'PASS' : 'FAIL'}`);
        console.log(`Tasks: ${tasks1.length} (Expected: 1) - ${tasks1[0].title === 'Task W1' ? 'PASS' : 'FAIL'}`);

        // 6. Verify Isolation - Fetch for Wedding 2
        const shaguns2 = await Shagun.find({ wedding: wedding2._id });
        const guests2 = await Guest.find({ wedding: wedding2._id });
        const expenses2 = await Expense.find({ wedding: wedding2._id });
        const tasks2 = await Task.find({ wedding: wedding2._id });

        console.log('\n--- VERIFICATION WEDDING 2 ---');
        console.log(`Shaguns: ${shaguns2.length} (Expected: 1) - ${shaguns2[0].name === 'Shagun W2' ? 'PASS' : 'FAIL'}`);
        console.log(`Guests: ${guests2.length} (Expected: 1) - ${guests2[0].name === 'Guest W2' ? 'PASS' : 'FAIL'}`);
        console.log(`Expenses: ${expenses2.length} (Expected: 1) - ${expenses2[0].title === 'Expense W2' ? 'PASS' : 'FAIL'}`);
        console.log(`Tasks: ${tasks2.length} (Expected: 1) - ${tasks2[0].title === 'Task W2' ? 'PASS' : 'FAIL'}`);

        // Cleanup
        await User.findByIdAndDelete(user._id);
        await Wedding.deleteMany({ user: user._id });
        await Shagun.deleteMany({ wedding: { $in: [wedding1._id, wedding2._id] } });
        await Guest.deleteMany({ wedding: { $in: [wedding1._id, wedding2._id] } });
        await Expense.deleteMany({ wedding: { $in: [wedding1._id, wedding2._id] } });
        await Task.deleteMany({ wedding: { $in: [wedding1._id, wedding2._id] } });
        console.log('\nTest Data Cleaned Up');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection Closed');
    }
};

runTest();
