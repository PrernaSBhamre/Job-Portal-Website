const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');
dotenv.config();

const testAdminLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@gmail.com';
        const password = 'admin@31';
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin not found in database');
            process.exit(1);
        }
        
        const isMatch = await admin.matchPassword(password);
        console.log('Password Match Result:', isMatch);
        process.exit(isMatch ? 0 : 1);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testAdminLogin();
