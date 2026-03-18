const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { protect, isRecruiter } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, isRecruiter, createCompany)
  .get(getCompanies);

router.route('/:id')
  .get(getCompanyById)
  .put(protect, isRecruiter, updateCompany)
  .delete(protect, isRecruiter, deleteCompany);

module.exports = router;
