const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, isRecruiter } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, isRecruiter, createJob)
  .get(getJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, isRecruiter, updateJob)
  .delete(protect, isRecruiter, deleteJob);

module.exports = router;
