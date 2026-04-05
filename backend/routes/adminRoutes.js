const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getAllApplications,
  getAllCompanies,
  updateCompanyStatus,
  deleteCompany,
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getSettings,
  updateSettings,
  toggleUserFlag,
  resolveReport,
  getAuditLogs
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

// All routes are protected and restricted to admin
router.use(adminProtect);

router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Job Management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Company Management
router.get('/companies', getAllCompanies);
router.put('/companies/:id/status', updateCompanyStatus);
router.delete('/companies/:id', deleteCompany);

// Application Monitoring
router.get('/applications', getAllApplications);

// Resource Management
router.get('/resources', getAllResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Profile & Security
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

// System Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Audit & Moderation
router.get('/audit-logs', getAuditLogs);
router.put('/users/:id/flag', toggleUserFlag);
router.put('/reports/:id/resolve', resolveReport);

module.exports = router;
