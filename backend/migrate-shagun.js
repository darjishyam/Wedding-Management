const mongoose = require('mongoose');
const Shagun = require('./models/Shagun');
require('dotenv').config();

const migrateShagunAmounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Migration...");

        const shaguns = await Shagun.find({});
        console.log(`Found ${shaguns.length} shagun records.`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const shagun of shaguns) {
            const originalAmount = shagun.amount;

            // If it's already a clean number (as string), pure parse
            // If it has "₹ " or "," strip them
            let cleanAmountString = originalAmount.toString().replace(/[^0-9.]/g, '');
            let numericAmount = parseFloat(cleanAmountString);

            if (!isNaN(numericAmount)) {
                // We need to update directly to bypass potential type checks if we switched schema locally already (though we haven't)
                // Actually, since schema is currently String, we can't save it as Number unless we use 'strict: false' or raw update.
                // But we plan to change schema to Number.
                // So, let's use UPDATE ONE with explicit set.
                // Mongoose might cast it back to string if schema says String. 
                // CRITICAL: We need to change the data type in MongoDB. 
                // Mongoose keeps it simple. We should use `updateOne` which sends the raw command.

                // However, if the current Schema says String, Mongoose might cast it back to String on retrieval if we aren't careful?
                // No, MongoDB stores BSON types. 

                await Shagun.collection.updateOne(
                    { _id: shagun._id },
                    { $set: { amount: numericAmount } }
                );

                console.log(`Migrated: "${originalAmount}" -> ${numericAmount}`);
                updatedCount++;
            } else {
                console.error(`Failed to parse: "${originalAmount}" (ID: ${shagun._id})`);
                errorCount++;
            }
        }

        console.log("--------------------------------------------------");
        console.log(`Migration Complete.`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);
        process.exit();
    } catch (error) {
        console.error("Migration Fatal Error:", error);
        process.exit(1);
    }
};

migrateShagunAmounts();
