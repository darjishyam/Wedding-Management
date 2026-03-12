const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: '24034211016@gnu.ac.in' }); // Email from logs
        if (user) {
            console.log("User:", user.email);
            console.log("Is Premium:", user.isPremium);
            console.log("ID:", user._id);
        } else {
            console.log("User not found");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
