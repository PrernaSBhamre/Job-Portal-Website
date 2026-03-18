const express = require('express');
const router = express.Router();
const {
  saveJob,
  getSavedJobs,
  removeSavedJob,
} = require('../controllers/savedJobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSavedJobs);

router.route('/:jobId')
  .post(protect, saveJob)
  .delete(protect, removeSavedJob);

module.exports = router;
