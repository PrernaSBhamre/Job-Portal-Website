const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');

dotenv.config();

async function fixJobs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Bulk update status fields for ALL jobs
        await Job.updateMany(
            {},
            {
                $set: {
                    isClosed: false,
                    isActive: true,
                    isApproved: true
                }
            }
        );
        console.log('Updated status fields for all jobs.');

        // 2. Migrate old jobs using bulkWrite to bypass validation if necessary, or just updateMany with $rename
        // Actually, let's just use updateMany with $set and provide default values for required fields
        
        // Find jobs that have 'company' but not 'companyId'
        const rawCollection = mongoose.connection.collection('jobs');
        const oldJobs = await rawCollection.find({ company: { $exists: true }, companyId: { $exists: false } }).toArray();
        console.log(`Found ${oldJobs.length} old jobs to migrate.`);

        for (const job of oldJobs) {
            await rawCollection.updateOne(
                { _id: job._id },
                {
                    $set: {
                        companyId: job.company,
                        employerId: job.created_by,
                        openings: job.openings || 1, // Default value if missing
                        category: job.category || 'IT',
                        type: job.jobType || job.type || 'Full-Time'
                    }
                }
            );
            console.log(`Migrated job: ${job.title}`);
        }

        console.log('Migration complete!');
        await mongoose.disconnect();
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

fixJobs();
