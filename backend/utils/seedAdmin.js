const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        // 1. Connect to Database
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('❌ Error: MONGO_URI is not defined in .env');
            process.exit(1);
        }

        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 2. Define Admin Data
        const adminEmail = 'admin@shagun.com';
        const adminPassword = 'admin123';

        // 3. Check if Admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`ℹ️ Admin user already exists (${adminEmail}). Updating password and role...`);
            
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(adminPassword, salt);
            existingAdmin.role = 'admin';
            existingAdmin.isVerified = true;
            
            await existingAdmin.save();
            console.log('✅ Admin credentials updated successfully');
        } else {
            // 4. Create New Admin
            console.log(`⏳ Creating new admin user (${adminEmail})...`);
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin user created successfully');
        }

        // 5. Close connection
        console.log('\n--- Credentials ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('-------------------\n');

        await mongoose.connection.close();
        console.log('👋 Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
