const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Wedding = require('./models/Wedding');
const User = require('./models/User');

dotenv.config();

const auditEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const events = await Event.find({});
        console.log(`Found ${events.length} events.`);

        for (const event of events) {
            console.log(`\n-----------------------------------`);
            console.log(`Event ID: ${event._id}`);
            console.log(`Name: ${event.name}`);
            console.log(`Wedding ID: ${event.wedding}`);

            const wedding = await Wedding.findById(event.wedding);
            if (!wedding) {
                console.log(`[CRITICAL] ORPHAN EVENT! Wedding ${event.wedding} NOT FOUND.`);
                continue;
            }

            console.log(`Wedding Found. User (Owner) ID: ${wedding.user}`);

            const user = await User.findById(wedding.user);
            if (!user) {
                console.log(`[CRITICAL] ORPHAN WEDDING! User ${wedding.user} NOT FOUND.`);
            } else {
                console.log(`User Found: ${user.email}`);
            }

            // Check if event is in wedding's events array
            const isLinked = wedding.events.some(e => e.toString() === event._id.toString());
            console.log(`Linked in Wedding.events array? ${isLinked ? 'YES' : 'NO'}`);
        }
        console.log(`\n-----------------------------------`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

auditEvents();
