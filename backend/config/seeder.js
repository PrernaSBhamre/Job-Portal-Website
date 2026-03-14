const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// Load Models
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Connect to DB locally
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal');

const importData = async () => {
  try {
    // 1. Clear existing data
    await Application.deleteMany();
    await Job.deleteMany();
    await Company.deleteMany();
    await User.deleteMany();

    console.log('Existing Data Cleared...');

    // 2. Create mock Users
    const users = await User.create([
      {
        fullname: 'John Recruiter',
        email: 'john@company.com',
        phoneNumber: 1112223333,
        password: 'password123', // In a real app, this should be hashed
        role: 'recruiter',
      },
      {
        fullname: 'Jane Applicant',
        email: 'jane@student.com',
        phoneNumber: 4445556666,
        password: 'password123', // In a real app, this should be hashed
        role: 'student',
        profile: {
          bio: 'Recent CS Graduate looking for a frontend role.',
          skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        }
      },
      {
        fullname: 'Bob Developer',
        email: 'bob@student.com',
        phoneNumber: 7778889999,
        password: 'password123', // In a real app, this should be hashed
        role: 'student',
        profile: {
          bio: 'Experienced backend developer seeking new challenges.',
          skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        }
      }
    ]);

    const recruiterId = users[0]._id;
    const student1Id = users[1]._id;
    const student2Id = users[2]._id;

    console.log('Users Created...');

    // 3. Create mock Companies
    const companies = await Company.create([
      {
        name: 'TechNova Solutions',
        description: 'Leading provider of cloud infrastructure and scalable web applications.',
        website: 'https://technova.example.com',
        location: 'San Francisco, CA',
        userId: recruiterId
      },
      {
        name: 'DataFlow Inc',
        description: 'Pioneering big data analytics and machine learning services.',
        website: 'https://dataflow.example.com',
        location: 'New York, NY',
        userId: recruiterId
      }
    ]);

    const company1Id = companies[0]._id;
    const company2Id = companies[1]._id;

    console.log('Companies Created...');

    // 4. Create mock Jobs
    const jobs = await Job.create([
      {
        title: 'Frontend React Developer',
        description: 'We are looking for an experienced React developer to build modern UIs.',
        requirements: ['3+ years of React', 'Experience with Redux', 'Responsive Design'],
        salary: 120000,
        experienceLevel: 3,
        location: 'Remote',
        jobType: 'Full-Time',
        position: 2,
        company: company1Id,
        created_by: recruiterId
      },
      {
        title: 'Backend Node.js Engineer',
        description: 'Join our core infrastructure team to build scalable microservices.',
        requirements: ['5+ years of Node.js', 'MongoDB expertise', 'AWS experience'],
        salary: 140000,
        experienceLevel: 5,
        location: 'San Francisco, CA',
        jobType: 'Full-Time',
        position: 1,
        company: company1Id,
        created_by: recruiterId
      },
      {
        title: 'Data Scientist',
        description: 'Design and implement predictive models for our fintech clients.',
        requirements: ['Python', 'TensorFlow', 'SQL', 'Masters Degree'],
        salary: 135000,
        experienceLevel: 2,
        location: 'New York, NY',
        jobType: 'Contract',
        position: 3,
        company: company2Id,
        created_by: recruiterId
      }
    ]);

    const job1Id = jobs[0]._id;
    const job2Id = jobs[1]._id;

    console.log('Jobs Created...');

    // 5. Create mock Applications
    await Application.create([
      {
        job: job1Id,
        applicant: student1Id,
        status: 'pending' // Jane applied for Frontend role
      },
      {
        job: job2Id,
        applicant: student2Id,
        status: 'accepted' // Bob applied for Backend role and was accepted
      }
    ]);

    // Update Jobs to include the application references
    const app1 = await Application.findOne({ applicant: student1Id });
    const app2 = await Application.findOne({ applicant: student2Id });
    
    await Job.findByIdAndUpdate(job1Id, { $push: { applications: app1._id } });
    await Job.findByIdAndUpdate(job2Id, { $push: { applications: app2._id } });

    console.log('Applications Created...');

    console.log('DATA IMPORTED SUCCESSFULLY!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await Application.deleteMany();
        await Job.deleteMany();
        await Company.deleteMany();
        await User.deleteMany();
    
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error with data destruction: ${error}`);
        process.exit(1);
    }
}

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
