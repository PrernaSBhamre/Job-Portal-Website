const express = require('express');
const router = express.Router();
const {
  getRecruiterStats,
  getRecruiterJobs,
  updateJob,
  getJobApplicants,
  getRecentApplications,
  updateApplicationStatus,
  manageCompanyProfile
} = require('../controllers/recruiterController');
const { recruiterProtect } = require('../middleware/recruiterAuth');

// Stats
router.get('/stats', recruiterProtect, getRecruiterStats);

// My Jobs
router.get('/jobs', recruiterProtect, getRecruiterJobs);
router.put('/jobs/:id', recruiterProtect, updateJob);

// Job Applicants
router.get('/jobs/:id/applicants', recruiterProtect, getJobApplicants);

// Applications
router.get('/recent-applications', recruiterProtect, getRecentApplications);
router.put('/applications/:id/status', recruiterProtect, updateApplicationStatus);

// Company Profile
router.get('/company', recruiterProtect, manageCompanyProfile);
router.put('/company', recruiterProtect, manageCompanyProfile);

module.exports = router;
