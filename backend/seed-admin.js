const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to ${process.env.MONGO_URI}`);

        const adminEmail = 'admin@shagun.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            mobile: '9999999999',
            role: 'admin',
            isVerified: true
        });

        console.log('Admin user created successfully:');
        console.log('Email: admin@shagun.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
