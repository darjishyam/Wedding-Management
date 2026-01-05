const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Wedding = require('./models/Wedding');

dotenv.config();

const cleanAdminWedding = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to ${process.env.MONGO_URI}`);

        const admin = await User.findOne({ email: 'admin@shagun.com' });
        if (admin) {
            const result = await Wedding.deleteMany({ user: admin._id });
            console.log(`Deleted ${result.deletedCount} weddings for admin user.`);
        } else {
            console.log('Admin user not found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error cleaning admin wedding:', error);
        process.exit(1);
    }
};

cleanAdminWedding();
