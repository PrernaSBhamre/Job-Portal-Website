const cron = require('node-cron');

const initCronJobs = () => {
  // Example Cron Job: Runs at midnight every day
  cron.schedule('0 0 * * *', () => {
    console.log('[Cron] Running daily cleanup tasks...');
    // In the future, you can add logic here like:
    // - Deleting expired job postings
    // - Sending daily email digests to recruiters
  });

  console.log('Automated background tasks (Cron Jobs) initialized.');
};

module.exports = { initCronJobs };
