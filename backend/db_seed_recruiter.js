const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');

dotenv.config();

const seedRecruiter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Prerna:Prerna3110@jobportal.pg6wnnm.mongodb.net/jobportal');
        console.log('MongoDB Connected for Seeding...');

        // 1. Create Recruiter User
        const email = 'recruiter@jobportal.com';
        let recruiter = await User.findOne({ email });

        if (!recruiter) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('recruiter@123', salt);

            recruiter = await User.create({
                fullname: 'Professional Recruiter',
                email: email,
                password: hashedPassword,
                role: 'recruiter',
                phoneNumber: '9876543210',
                isVerified: true
            });
            console.log('Recruiter user created: recruiter@jobportal.com / recruiter@123');
        } else {
            console.log('Recruiter user already exists.');
        }

        // 2. Create Company for this Recruiter
        const companyName = 'Tech Innovations Inc.';
        let company = await Company.findOne({ name: companyName });

        if (!company) {
            company = await Company.create({
                name: companyName,
                description: 'A leading technology services company specializing in AI and cloud solutions.',
                website: 'https://techinnovations.example.com',
                location: 'Pune, Maharashtra',
                industry: 'Information Technology',
                companySize: '500-1000 employees',
                userId: recruiter._id,
                isApproved: true
            });
            console.log('Sample company created for recruiter.');
        } else {
            console.log('Sample company already exists.');
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedRecruiter();
