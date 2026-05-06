const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getAppliedJobs,
  withdrawApplication,
  checkApplicationStatus,
  getApplicants,
  updateStatus
} = require('../controllers/applicationController');
const { protect, isEmployer } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadMiddleware');

// --- STUDENT ROUTES ---

router.route('/user')
  .get(protect, getAppliedJobs);

router.get('/check/:jobId', protect, checkApplicationStatus);

router.route('/job/:jobId')
  .post(protect, uploadResume.single('resume'), applyForJob)
  // --- EMPLOYER ROUTE ---
  .get(protect, isEmployer, getApplicants);

router.route('/:id')
  .delete(protect, withdrawApplication);

// --- EMPLOYER ROUTES ---

router.route('/:id/status')
  .patch(protect, isEmployer, updateStatus);

module.exports = router;
