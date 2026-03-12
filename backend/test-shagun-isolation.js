const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Wedding = require('./models/Wedding');
const Shagun = require('./models/Shagun');

dotenv.config();

const testShagunIsolation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create a test user
        const testEmail = `test_shagun_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Test User',
            email: testEmail,
            password: 'password123',
            mobile: `9${Math.floor(Math.random() * 1000000000)}`
        });
        console.log('Created test user:', user.email);

        // 2. Create two weddings for this user
        const wedding1 = await Wedding.create({
            user: user._id,
            brideName: 'Bride 1',
            groomName: 'Groom 1',
            date: new Date(),
            type: 'bride'
        });
        console.log('Created Wedding 1:', wedding1._id);

        const wedding2 = await Wedding.create({
            user: user._id,
            brideName: 'Bride 2',
            groomName: 'Groom 2',
            date: new Date(),
            type: 'groom'
        });
        console.log('Created Wedding 2:', wedding2._id);

        // 3. Add Shagun to Wedding 1
        const shagun1 = await Shagun.create({
            wedding: wedding1._id,
            name: 'Guest 1',
            amount: 100,
            type: 'received'
        });
        console.log('Added Shagun to Wedding 1');

        // 4. Add Shagun to Wedding 2
        const shagun2 = await Shagun.create({
            wedding: wedding2._id,
            name: 'Guest 2',
            amount: 200,
            type: 'received'
        });
        console.log('Added Shagun to Wedding 2');

        // 5. Fetch Shaguns for Wedding 1 (Simulate Controller Logic)
        // We can't easily call the controller directly without mocking req/res, 
        // so we'll test the Mongoose query logic the controller uses.
        const shagunsForWedding1 = await Shagun.find({ wedding: wedding1._id });
        console.log(`Fetched ${shagunsForWedding1.length} shaguns for Wedding 1`);

        if (shagunsForWedding1.length === 1 && shagunsForWedding1[0].name === 'Guest 1') {
            console.log('PASS: Wedding 1 data is correct');
        } else {
            console.error('FAIL: Wedding 1 data is incorrect');
        }

        const shagunsForWedding2 = await Shagun.find({ wedding: wedding2._id });
        console.log(`Fetched ${shagunsForWedding2.length} shaguns for Wedding 2`);

        if (shagunsForWedding2.length === 1 && shagunsForWedding2[0].name === 'Guest 2') {
            console.log('PASS: Wedding 2 data is correct');
        } else {
            console.error('FAIL: Wedding 2 data is incorrect');
        }

        // Cleanup
        await Shagun.deleteMany({ wedding: { $in: [wedding1._id, wedding2._id] } });
        await Wedding.deleteMany({ user: user._id });
        await User.deleteOne({ _id: user._id });
        console.log('Cleanup done');

        process.exit(0);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            console.error('Validation Error Details:', errors);
        }
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testShagunIsolation();
