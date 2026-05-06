const axios = require('axios');

async function debugJobs() {
    try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        console.log('Jobs Length:', response.data.jobs ? response.data.jobs.length : response.data.length);
        const firstJob = (response.data.jobs && response.data.jobs[0]) || response.data[0];
        console.log('First Job Keys:', Object.keys(firstJob));
        console.log('First Job CompanyId:', firstJob.companyId);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugJobs();
