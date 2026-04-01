const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Support = require('../models/Support');
const Resource = require('../models/Resource');
const Admin = require('../models/Admin');

// @desc    Get dashboard statistics with daily trends and detailed counts
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Totals
    const userCount = await User.countDocuments();
    const jobSeekerCount = await User.countDocuments({ role: { $in: ['jobSeeker', 'student'] } });
    const employerCount = await User.countDocuments({ role: { $in: ['employer', 'recruiter'] } });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    const jobCount = await Job.countDocuments();
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const approvedJobs = await Job.countDocuments({ status: 'approved' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const jobsToday = await Job.countDocuments({ createdAt: { $gte: today } });
    
    const applicationCount = await Application.countDocuments();
    const appsToday = await Application.countDocuments({ createdAt: { $gte: today } });
    
    const companyCount = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });
    
    const resourceCount = await Resource.countDocuments();

    // Growth Trends (Last 7 days)
    const last7Days = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Role Distribution
    const roleDist = [
      { type: 'Job Seekers', value: jobSeekerCount },
      { type: 'Employers', value: employerCount },
      { type: 'Admins', value: adminCount }
    ];

    // Recent Activities
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullname email role createdAt isVerified isBlocked');
    
    const recentJobs = await Job.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('company', 'name logo');

    const recentApplications = await Application.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('job', 'title')
      .populate('applicant', 'fullname email profilePhoto');

    res.json({
      success: true,
      totals: {
        users: userCount,
        jobSeekers: jobSeekerCount,
        employers: employerCount,
        admins: adminCount,
        jobs: jobCount,
        pendingJobs,
        approvedJobs,
        closedJobs,
        jobsToday,
        applications: applicationCount,
        appsToday,
        companies: companyCount,
        verifiedCompanies,
        resources: resourceCount
      },
      trends: last7Days,
      roleDistribution: roleDist,
      recent: {
        users: recentUsers,
        jobs: recentJobs,
        applications: recentApplications,
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- User Management ---

// @desc    Get all users with search, filter, and pagination
// @route   GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = 'all', status = 'all' } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role !== 'all') {
      if (role === 'jobSeeker') query.role = { $in: ['jobSeeker', 'student'] };
      else if (role === 'employer') query.role = { $in: ['employer', 'recruiter'] };
      else query.role = role;
    }

    if (status === 'blocked') query.isBlocked = true;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalUsers: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user verification/block status
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { isVerified, isBlocked, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    if (role !== undefined) user.role = role;

    await user.save();
    res.json({ success: true, message: 'User status updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// --- Job Management ---

// @desc    Get all jobs with search, filter, and pagination
// @route   GET /api/admin/jobs
const getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', isFeatured } = req.query;
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .populate('created_by', 'fullname email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalJobs: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status/featured
// @route   PUT /api/admin/jobs/:id/status
const updateJobStatus = async (req, res, next) => {
  try {
    const { status, isFeatured } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (status !== undefined) job.status = status;
    if (isFeatured !== undefined) job.isFeatured = isFeatured;

    await job.save();
    res.json({ success: true, message: `Job updated successfully`, job });
  } catch (error) {
    next(error);
  }
};

// --- Company & Application Management ---

const getAllApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;

    const applications = await Application.find(query)
      .populate('job', 'title')
      .populate('applicant', 'fullname email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalApplications: count
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const companies = await Company.find(query)
      .populate('userId', 'fullname email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Company.countDocuments(query);

    res.json({
      success: true,
      companies,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalCompanies: count
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCompanyStatus = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    company.isVerified = isVerified;
    await company.save();
    res.json({ success: true, message: 'Company verification updated' });
  } catch (error) {
    next(error);
  }
};

// --- Deletion Actions ---

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await User.deleteOne({ _id: user._id });
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await Job.deleteOne({ _id: job._id });
    res.json({ success: true, message: 'Job removed' });
  } catch (error) {
    next(error);
  }
};

// --- Resource Management ---

// @desc    Get all resources with pagination and search
// @route   GET /api/admin/resources
const getAllResources = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category = 'all' } = req.query;
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (category !== 'all') {
      query.category = category;
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Resource.countDocuments(query);

    res.json({
      success: true,
      resources,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalResources: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a resource
// @route   POST /api/admin/resources
const createResource = async (req, res, next) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, message: 'Resource created successfully', resource });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a resource
// @route   PUT /api/admin/resources/:id
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, message: 'Resource updated successfully', resource });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/admin/resources/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    await resource.deleteOne();
    res.json({ success: true, message: 'Resource removed successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    await Company.deleteOne({ _id: company._id });
    await Job.deleteMany({ company: company._id });
    res.json({ success: true, message: 'Company and its jobs removed' });
  } catch (error) {
    next(error);
  }
};

// --- Profile & Security ---

// @desc    Get current admin profile
// @route   GET /api/admin/profile
const getAdminProfile = async (req, res, next) => {
  try {
    // req.user is set by adminProtect middleware
    res.json({
      success: true,
      admin: {
        _id: req.user._id,
        email: req.user.email,
        fullname: req.user.fullname,
        avatar: req.user.avatar,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
const updateAdminProfile = async (req, res, next) => {
  try {
    const { fullname, email, avatar } = req.body;
    const admin = await Admin.findById(req.user._id);

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    if (fullname) admin.fullname = fullname;
    if (email) admin.email = email;
    if (avatar) admin.avatar = avatar;

    await admin.save();
    res.json({ success: true, message: 'Profile updated successfully', admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
const changeAdminPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id);

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const isMatch = await admin.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid current password' });

    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  changeAdminPassword
};
