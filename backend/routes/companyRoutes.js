const express = require('express');
const router = express.Router();
const {
  createCompany,
  getMyCompany,
  updateCompany,
  getAllCompanies
} = require('../controllers/companyController');
const { protect, isEmployer } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllCompanies)
  .post(protect, isEmployer, createCompany);

router.route('/mine')
  .get(protect, isEmployer, getMyCompany);

router.route('/:id')
  .put(protect, isEmployer, updateCompany);

module.exports = router;
