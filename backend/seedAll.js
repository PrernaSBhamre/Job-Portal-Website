const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Company = require('./models/Company');
const Application = require('./models/Application');
const Admin = require('./models/Admin');

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
        // 1. Clear Collections
        await User.deleteMany();
        await Job.deleteMany();
        await Company.deleteMany();
        await Application.deleteMany();
        await Admin.deleteMany();

        console.log('Collections Cleared...');

        // 2. Create Admin
        await Admin.create({
            email: 'admin@gmail.com',
            password: 'admin@31'
        });

        // 3. Create Employers
        const employers = await User.create([
            { fullname: 'Sundar Pichai', email: 'hr@google.com', phoneNumber: 9876543210, password: 'password123', role: 'recruiter', isVerified: true },
            { fullname: 'Satya Nadella', email: 'recruitment@microsoft.com', phoneNumber: 8765432109, password: 'password123', role: 'recruiter', isVerified: true },
            { fullname: 'Jeff Bezos', email: 'jobs@amazon.com', phoneNumber: 7654321098, password: 'password123', role: 'recruiter', isVerified: true }
        ]);

        // 4. Create Companies linked to Employers
        const companies = await Company.create([
            { name: 'Google', description: 'Tech Giant', location: 'Bangalore', website: 'https://google.com', userId: employers[0]._id, isApproved: true },
            { name: 'Microsoft', description: 'Computing Leader', location: 'Hyderabad', website: 'https://microsoft.com', userId: employers[1]._id, isApproved: true },
            { name: 'Amazon', description: 'E-commerce & Cloud', location: 'Pune', website: 'https://amazon.com', userId: employers[2]._id, isApproved: true }
        ]);

        // 5. Create Job Seekers
        const seekers = await User.create([
            { 
                fullname: 'Prerna Bhamre', email: 'seeker1@gmail.com', phoneNumber: 1112223334, password: 'password123', role: 'student', isVerified: true,
                profile: { skills: ['React', 'Node.js', 'MongoDB'], bio: 'Full-stack enthusiast.' }
            },
            { fullname: 'Rahul Sharma', email: 'seeker2@gmail.com', phoneNumber: 2223334445, password: 'password123', role: 'student', isVerified: true },
            { fullname: 'Ananya Iyer', email: 'seeker3@gmail.com', phoneNumber: 3334445556, password: 'password123', role: 'student', isVerified: true }
        ]);

        // 6. Create Jobs
        const jobs = await Job.create([
            { 
                title: 'Software Engineer', description: 'Build scalable web apps.', responsibilities: ['Coding', 'Unit Testing'], requirements: ['Java', 'Spring'], salary: '₹12L - ₹18L', 
                experienceLevel: '0-2 Years', location: 'Bangalore', jobType: 'Full-Time', position: 5, tags: ['Java', 'Spring Boot'], 
                company: companies[0]._id, created_by: employers[0]._id, status: 'approved', isApproved: true, isActive: true
            },
            { 
                title: 'Frontend Developer', description: 'Create stunning UIs.', requirements: ['React', 'Tailwind'], salary: '₹8L - ₹12L', 
                experienceLevel: '1-3 Years', location: 'Remote', jobType: 'Full-Time', position: 3, tags: ['React', 'CSS'], 
                company: companies[1]._id, created_by: employers[1]._id, status: 'approved', isFeatured: true, isApproved: true, isActive: true
            },
            { 
                title: 'Data Analyst', description: 'Analyze business data.', requirements: ['SQL', 'Python'], salary: '₹6L - ₹9L', 
                experienceLevel: 'Fresher', location: 'Hyderabad', jobType: 'Internship', position: 10, tags: ['Python', 'SQL'], 
                company: companies[2]._id, created_by: employers[2]._id, status: 'approved', isApproved: true, isActive: true
            }
        ]);

        // 7. Create Applications with valid status
        await Application.create([
            { 
                job: jobs[0]._id, applicant: seekers[0]._id, status: 'Applied', 
                resume: 'https://toolsandjob.com/resumes/prerna_bhamre.pdf',
                fullName: 'Prerna Bhamre', phone: '1112223334', college: 'Tech Institute', graduationYear: 2024
            },
            { 
                job: jobs[1]._id, applicant: seekers[1]._id, status: 'Shortlisted', 
                resume: 'https://toolsandjob.com/resumes/rahul_sharma.pdf',
                fullName: 'Rahul Sharma', phone: '2223334445', college: 'University of Engineering', graduationYear: 2023
            },
            { 
                job: jobs[1]._id, applicant: seekers[2]._id, status: 'Rejected', 
                resume: 'https://toolsandjob.com/resumes/ananya_iyer.pdf',
                fullName: 'Ananya Iyer', phone: '3334445556', college: 'Global Tech College', graduationYear: 2025
            }
        ]);

        console.log('Seeding Completed Successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

connectDB().then(() => seedData());
