const Company = require('../models/Company');

// @desc    Get employer's company
// @route   GET /api/company/mine
// @access  Private/Employer
const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found. Create company profile first.' });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new company
// @route   POST /api/company
// @access  Private/Employer
const createCompany = async (req, res, next) => {
  try {
    const { name, logo, website, industry, size, description, location } = req.body;

    const existingCompany = await Company.findOne({ employerId: req.user._id });
    if (existingCompany) {
      res.status(400);
      throw new Error('You have already created a company profile.');
    }

    const companyExistsByName = await Company.findOne({ name });
    if (companyExistsByName) {
      res.status(400);
      throw new Error('Company name already exists');
    }

    const company = await Company.create({
      employerId: req.user._id,
      name,
      logo,
      website,
      industry,
      size,
      description,
      location,
      isVerified: false // Explicitly set to false, require admin approval
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Update company information
// @route   PUT /api/company/:id
// @access  Private/Employer
const updateCompany = async (req, res, next) => {
  try {
    const { name, logo, website, industry, size, description, location } = req.body;

    const company = await Company.findById(req.params.id);

    if (company) {
      // Check if user is the owner
      if (company.employerId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this company');
      }

      company.name = name || company.name;
      company.description = description || company.description;
      company.website = website || company.website;
      company.industry = industry || company.industry;
      company.size = size || company.size;
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

// @desc    Get all active companies for the public frontend
// @route   GET /api/company
// @access  Public
const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ isVerified: true }).sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCompany,
  createCompany,
  updateCompany,
  getAllCompanies
};
