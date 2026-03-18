const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
  withdrawApplication,
} = require('../controllers/applicationController');
const { protect, isRecruiter } = require('../middleware/authMiddleware');

router.route('/user')
  .get(protect, getAppliedJobs);

router.route('/job/:jobId')
  .post(protect, applyForJob)
  .get(protect, isRecruiter, getApplicants);

router.route('/:id/status')
  .put(protect, isRecruiter, updateStatus);

router.route('/:id')
  .delete(protect, withdrawApplication);

module.exports = router;
