async function debugJobs() {
    try {
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();
        console.log('Jobs Length:', data.jobs ? data.jobs.length : data.length);
        const firstJob = (data.jobs && data.jobs[0]) || data[0];
        console.log('First Job Keys:', Object.keys(firstJob || {}));
        console.log('First Job CompanyId:', firstJob ? firstJob.companyId : 'N/A');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugJobs();
