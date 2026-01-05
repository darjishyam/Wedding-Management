const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://professor:CQ33cuFBo1SoplWf@cluster0.9zk2jrk.mongodb.net/Shagun";

const eventSchema = new mongoose.Schema({
    wedding: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding' },
    name: String,
    date: Date
});
const Event = mongoose.model('Event', eventSchema);

const weddingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});
const Wedding = mongoose.model('Wedding', weddingSchema);

const userSchema = new mongoose.Schema({
    email: String
});
const User = mongoose.model('User', userSchema);

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("CONNECTED");
        const events = await Event.find({});
        console.log(`TOTAL EVENTS: ${events.length}`);

        for (const e of events) {
            let status = "OK";
            const w = await Wedding.findById(e.wedding);
            if (!w) {
                status = "MISSING_WEDDING";
                console.log(`[${status}] ID:${e._id} Name:${e.name} Wedding:${e.wedding}`);
                continue;
            }

            const u = await User.findById(w.user);
            if (!u) {
                status = "MISSING_USER";
                console.log(`[${status}] ID:${e._id} Name:${e.name} Wedding:${e.wedding} User:${w.user}`);
                continue;
            }

            const linked = w.events.some(id => id.toString() === e._id.toString());
            if (!linked) {
                status = "NOT_LINKED";
            }
            console.log(`[${status}] ID:${e._id} Name:${e.name} Wedding:${e.wedding} Linked:${linked}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
