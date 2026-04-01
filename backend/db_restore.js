const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Admin = require('./models/Admin');

const dbURI = process.env.MONGO_URI || 'mongodb+srv://Prerna:Prerna3110@jobportal.pg6wnnm.mongodb.net/jobportal';

async function scrub() {
    try {
        await mongoose.connect(dbURI);
        console.log('Scrubbing DB starting...');

        // 1. Force-verify ALL users
        const users = await User.updateMany({}, { $set: { isVerified: true } });
        console.log(`Updated ${users.modifiedCount} users to verified.`);

        // 2. Ensure admin account is correct
        const admin = await Admin.findOne({ email: 'admin@gmail.com' });
        if (!admin) {
            await Admin.create({
                email: 'admin@gmail.com',
                password: 'admin@31',
                role: 'admin',
                fullname: 'System Admin'
            });
            console.log('Admin account (re)provisioned.');
        } else {
             console.log('Admin account verified as existing.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Scrub failed:', err);
        process.exit(1);
    }
}

scrub();
