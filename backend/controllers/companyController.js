const Company = require('../models/Company');

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private/Recruiter
const createCompany = async (req, res, next) => {
  try {
    const { name, description, website, location, logo } = req.body;

    const companyExists = await Company.findOne({ name });
    if (companyExists) {
      res.status(400);
      throw new Error('Company name already exists');
    }

    const company = await Company.create({
      name,
      description,
      website,
      location,
      logo,
      userId: req.user.id,
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific company details
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (company) {
      res.json(company);
    } else {
      res.status(404);
      throw new Error('Company not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update company information
// @route   PUT /api/companies/:id
// @access  Private/Recruiter
const updateCompany = async (req, res, next) => {
  try {
    const { name, description, website, location, logo } = req.body;

    const company = await Company.findById(req.params.id);

    if (company) {
      // Check if user is the owner or an admin
      if (company.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this company');
      }

      company.name = name || company.name;
      company.description = description || company.description;
      company.website = website || company.website;
      company.location = location || company.location;
      company.logo = logo || company.logo;

      const updatedCompany = await company.save();
      res.json(updatedCompany);
    } else {
      res.status(404);
      throw new Error('Company not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove company
// @route   DELETE /api/companies/:id
// @access  Private/Recruiter
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (company) {
      // Check if user is the owner or an admin
      if (company.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this company');
      }

      await Company.deleteOne({ _id: company._id });
      res.json({ message: 'Company removed' });
    } else {
      res.status(404);
      throw new Error('Company not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
