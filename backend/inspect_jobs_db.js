const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const jobSchema = new mongoose.Schema({
    title: String,
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const companySchema = new mongoose.Schema({
    name: String
});

const Job = mongoose.model('Job', jobSchema);
const Company = mongoose.model('Company', companySchema);

async function inspectJobs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const jobs = await Job.find().populate('companyId').limit(2);
        console.log('Jobs Found:', jobs.length);
        jobs.forEach(j => {
            console.log(`Job: ${j.title}, Company: ${j.companyId ? j.companyId.name : 'NULL'}`);
        });
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

inspectJobs();
