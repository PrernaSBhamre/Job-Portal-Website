const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'd:/DRUSHYA INTERSHIP WORKS/JobPortal_website/backend/.env' });

const User = require('./models/User');
const Job = require('./models/Job');
const Company = require('./models/Company');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({});
    const jobs = await Job.find({});
    
    const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const jobStatusCounts = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
    }, {});

    console.log('--- DETAILED DB AUDIT ---');
    console.log(`Total Users: ${users.length}`, roleCounts);
    console.log(`Total Jobs: ${jobs.length}`, jobStatusCounts);
    process.exit();
  })
  .catch(err => {
    console.error('Atlas connection error:', err);
    process.exit(1);
  });
