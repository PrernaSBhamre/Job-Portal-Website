const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Company = require('./models/Company');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await Job.deleteMany();
        await Company.deleteMany();
        console.log('Cleared Jobs and Companies for clean seed.');

        // Get existing recruiters, or create if none
        let recruiters = await User.find({ role: 'recruiter' });
        if (recruiters.length === 0) {
             recruiters = await User.create([
                { fullname: 'Sundar Pichai', email: 'hr@google.com', phoneNumber: 9876543210, password: 'password123', role: 'recruiter', isVerified: true },
                { fullname: 'Satya Nadella', email: 'recruitment@microsoft.com', phoneNumber: 8765432109, password: 'password123', role: 'recruiter', isVerified: true }
            ]);
        }

        // Create Companies
        const companies = await Company.create([
            { name: 'Google', description: 'Tech Giant', location: 'Bangalore', website: 'https://google.com', employerId: recruiters[0]._id, isVerified: true },
            { name: 'Microsoft', description: 'Computing Leader', location: 'Hyderabad', website: 'https://microsoft.com', employerId: recruiters[1 % recruiters.length]._id, isVerified: true }
        ]);

        console.log(`Seeded ${companies.length} verified companies.`);

        // Create Jobs
        const jobs = await Job.create([
            { 
                title: 'Software Engineer', description: 'Build scalable web apps.', type: 'Full-Time', location: 'Bangalore', isRemote: false, 
                skills: ['Java', 'Spring Boot'], experienceRequired: '0-2 Years', salaryMin: 1200000, salaryMax: 1800000, openings: 5,
                employerId: recruiters[0]._id, companyId: companies[0]._id, isApproved: true, isActive: true
            },
            { 
                title: 'Frontend Developer', description: 'Create stunning UIs.', type: 'Full-Time', location: 'Remote', isRemote: true, 
                skills: ['React', 'CSS'], experienceRequired: '1-3 Years', salaryMin: 800000, salaryMax: 1200000, openings: 3,
                employerId: recruiters[1 % recruiters.length]._id, companyId: companies[1 % companies.length]._id, isApproved: true, isActive: true
            }
        ]);
        
        console.log(`Seeded ${jobs.length} approved jobs.`);
        process.exit(0);

    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

connectDB().then(() => seedData());
