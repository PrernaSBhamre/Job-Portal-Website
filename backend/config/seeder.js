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
        fullname: 'TechNova HR',
        email: 'hr@technova.in',
        phoneNumber: 9876543210,
        password: 'password123',
        role: 'recruiter',
      },
      {
        fullname: 'Arjun Student',
        email: 'arjun@student.in',
        phoneNumber: 9123456780,
        password: 'password123',
        role: 'student',
        profile: {
          bio: 'Fresh Computer Science graduate looking for frontend roles.',
          skills: ['React', 'JavaScript', 'HTML5', 'CSS3'],
        }
      },
      {
        fullname: 'Priya Applicant',
        email: 'priya@student.in',
        phoneNumber: 9988776655,
        password: 'password123',
        role: 'student',
        profile: {
          bio: 'Passionate UI/UX designer with a portfolio of mobile apps.',
          skills: ['Figma', 'Adobe XD', 'Prototyping'],
        }
      }
    ]);

    const recruiterId = users[0]._id;
    const studentArjun = users[1]._id;
    const studentPriya = users[2]._id;

    console.log('Users Created...');

    // 3. Create mock Companies based on Figma
    const companies = await Company.create([
      {
        name: 'TechNova Systems',
        description: 'Leading provider of tech solutions in India.',
        location: 'Bangalore, India',
        userId: recruiterId
      },
      {
        name: 'Creative Pulse',
        description: 'Award-winning UI/UX design agency.',
        location: 'Pune, India',
        userId: recruiterId
      },
      {
        name: 'Infosys',
        description: 'Global leader in next-generation digital services and consulting.',
        location: 'Hyderabad, India',
        userId: recruiterId
      },
      {
        name: 'StartUp Inc',
        description: 'Fast-growing startup building the future of remote work.',
        location: 'Remote',
        userId: recruiterId
      },
      {
        name: 'DataFlow',
        description: 'Data analytics and machine learning experts.',
        location: 'Mumbai, India',
        userId: recruiterId
      },
      {
        name: 'QualityFirst',
        description: 'Software QA and testing automation services.',
        location: 'Hyderabad',
        userId: recruiterId
      }
    ]);

    const techNovaId = companies[0]._id;
    const creativePulseId = companies[1]._id;
    const infosysId = companies[2]._id;
    const startupIncId = companies[3]._id;
    const dataFlowId = companies[4]._id;
    const qualityFirstId = companies[5]._id;

    console.log('Companies Created...');

    // 4. Create mock Jobs based heavily on Figma Mockups
    const jobs = await Job.create([
      {
        title: 'Junior React Developer',
        description: 'We are looking for a fresh React developer to join our fast-paced Bangalore team.',
        requirements: ['React JS', 'TypeScript', 'Tailwind CSS understanding'],
        salary: '₹4L - ₹6L',
        experienceLevel: '0-1 Years',
        location: 'Bangalore, India',
        jobType: 'Full-Time',
        position: 5,
        tags: ['React', 'TypeScript', 'Tailwind'],
        company: techNovaId,
        created_by: recruiterId
      },
      {
        title: 'Fresher UI/UX Designer',
        description: 'Join our creative team to design modern interfaces for global clients.',
        requirements: ['Design portfolio', 'Figma expertise', 'Understanding of user journeys'],
        salary: '₹3.5L - ₹5L',
        experienceLevel: '0 Years',
        location: 'Pune, India',
        jobType: 'Full-Time',
        position: 2,
        tags: ['Figma', 'Adobe XD', 'Prototyping'],
        company: creativePulseId,
        created_by: recruiterId
      },
      {
        title: 'Software Engineer',
        description: 'Join our massive enterprise team. Looking for strong Java basics.',
        requirements: ['Core Java', 'Spring Boot', 'SQL fundamentals'],
        salary: '₹4L - ₹6L',
        experienceLevel: '0-2 Years',
        location: 'Hyderabad, India',
        jobType: 'Full-Time',
        position: 20,
        tags: ['Java', 'Spring Boot', 'SQL'],
        company: infosysId,
        created_by: recruiterId
      },
      {
        title: 'Frontend Dev Intern',
        description: 'Learn the ropes of frontend development in a fast growing startup environment.',
        requirements: ['HTML/CSS basics', 'Vanilla JS', 'Eagerness to learn'],
        salary: '₹15k - ₹25k / mo',
        experienceLevel: '0 Years',
        location: 'Remote',
        jobType: 'Internship',
        position: 3,
        tags: ['HTML', 'CSS', 'JavaScript'],
        company: startupIncId,
        created_by: recruiterId
      },
      {
        title: 'Python Developer',
        description: 'Data-focused Python developer needed for our analytics pipeline.',
        requirements: ['Python scripts', 'Django framework', 'PostgreSQL querying'],
        salary: '₹4.5L - ₹7L',
        experienceLevel: '0-1 Years',
        location: 'Mumbai, India',
        jobType: 'Full-Time',
        position: 4,
        tags: ['Python', 'Django', 'PostgreSQL'],
        company: dataFlowId,
        created_by: recruiterId
      },
      {
        title: 'QA Automation Eng.',
        description: 'Test automation role for freshers. Learn Selenium with us.',
        requirements: ['Java basics', 'Manual testing concepts', 'Selenium understanding'],
        salary: '₹15k - ₹25k / mo',
        experienceLevel: '0-1 Years',
        location: 'Hyderabad',
        jobType: 'Internship',
        position: 5,
        tags: ['Selenium', 'Java', 'Testing'],
        company: qualityFirstId,
        created_by: recruiterId
      }
    ]);

    console.log('Jobs Created...');

    // 5. Create mock Applications
    await Application.create([
      {
        job: jobs[0]._id, // React Developer
        applicant: studentArjun,
        status: 'pending' 
      },
      {
        job: jobs[1]._id, // UI Designer
        applicant: studentPriya,
        status: 'accepted'
      }
    ]);

    // Update Jobs to include the application references
    const app1 = await Application.findOne({ applicant: studentArjun });
    const app2 = await Application.findOne({ applicant: studentPriya });
    
    await Job.findByIdAndUpdate(jobs[0]._id, { $push: { applications: app1._id } });
    await Job.findByIdAndUpdate(jobs[1]._id, { $push: { applications: app2._id } });

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
