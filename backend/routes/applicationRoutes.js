const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
  withdrawApplication,
  checkApplicationStatus,
} = require('../controllers/applicationController');
const { protect, isRecruiter } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadMiddleware');

router.route('/user')
  .get(protect, getAppliedJobs);

router.get('/check/:jobId', protect, checkApplicationStatus);

router.route('/job/:jobId')
  .post(protect, uploadResume.single('resume'), applyForJob)
  .get(protect, isRecruiter, getApplicants);

router.route('/:id/status')
  .put(protect, isRecruiter, updateStatus);

router.route('/:id')
  .delete(protect, withdrawApplication);

module.exports = router;
