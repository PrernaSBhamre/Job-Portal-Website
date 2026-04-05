const express = require('express');
const router = express.Router();
const {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  pauseJob,
  closeJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, isEmployer } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, isEmployer, createJob);

router.route('/mine')
  .get(protect, isEmployer, getMyJobs);

router.route('/:id')
  .get(protect, isEmployer, getJobById)
  .put(protect, isEmployer, updateJob)
  .delete(protect, isEmployer, deleteJob);

router.route('/:id/pause')
  .patch(protect, isEmployer, pauseJob);

router.route('/:id/close')
  .patch(protect, isEmployer, closeJob);

module.exports = router;
