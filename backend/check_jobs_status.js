const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Job = require('./models/Job');
const Company = require('./models/Company');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkJobs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const totalJobs = await Job.countDocuments();
        console.log('Total Jobs in DB:', totalJobs);

        const approvedJobs = await Job.countDocuments({ isApproved: true });
        console.log('Approved Jobs:', approvedJobs);

        const activeJobs = await Job.countDocuments({ isActive: true });
        console.log('Active Jobs:', activeJobs);

        const closedJobs = await Job.countDocuments({ isClosed: true });
        console.log('Closed Jobs:', closedJobs);

        const query = {
            isApproved: true,
            isActive: true,
            isClosed: false
        };
        const visibleJobs = await Job.countDocuments(query);
        console.log('Visible Jobs (Public API query):', visibleJobs);

        if (visibleJobs === 0 && totalJobs > 0) {
            console.log('\nWARNING: You have jobs but none of them are visible because they are either not approved, not active, or closed.');
            const sampleJob = await Job.findOne();
            console.log('Sample Job Status:', {
                title: sampleJob.title,
                isApproved: sampleJob.isApproved,
                isActive: sampleJob.isActive,
                isClosed: sampleJob.isClosed
            });
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkJobs();
