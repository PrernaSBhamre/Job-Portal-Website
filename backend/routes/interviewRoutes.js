const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getEmployerInterviews,
  updateInterviewStatus
} = require('../controllers/interviewController');
const { protect, isEmployer } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, isEmployer, scheduleInterview);

router.route('/employer')
  .get(protect, isEmployer, getEmployerInterviews);

router.route('/:id/status')
  .patch(protect, isEmployer, updateInterviewStatus);

module.exports = router;
