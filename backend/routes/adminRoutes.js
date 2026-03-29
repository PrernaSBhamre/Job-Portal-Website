const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  getAllJobs,
  toggleJobApproval,
  toggleJobFeatured,
  deleteJob,
  getAllApplications,
  getAllCompanies,
  deleteCompany,
  getMessages,
  resolveMessage
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes are protected and restricted to admin
router.use(protect);
router.use(isAdmin);

router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleUserBlock);
router.delete('/users/:id', deleteUser);

// Job Management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/approve', toggleJobApproval);
router.put('/jobs/:id/feature', toggleJobFeatured);
router.delete('/jobs/:id', deleteJob);

// Company Management
router.get('/companies', getAllCompanies);
router.delete('/companies/:id', deleteCompany);

// Application Monitoring
router.get('/applications', getAllApplications);

// Support Messages
router.get('/messages', getMessages);
router.put('/messages/:id/resolve', resolveMessage);

module.exports = router;
