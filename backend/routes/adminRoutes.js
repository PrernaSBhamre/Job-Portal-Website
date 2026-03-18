const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAllApplications,
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/users')
  .get(protect, isAdmin, getAllUsers);

router.route('/users/:id')
  .delete(protect, isAdmin, deleteUser);

router.route('/jobs')
  .get(protect, isAdmin, getAllJobs);

router.route('/jobs/:id')
  .delete(protect, isAdmin, deleteJob);

router.route('/applications')
  .get(protect, isAdmin, getAllApplications);

module.exports = router;
