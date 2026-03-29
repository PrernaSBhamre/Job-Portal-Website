const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Support = require('../models/Support');

// @desc    Get dashboard statistics with daily trends and detailed counts
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userCount = await User.countDocuments();
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    const jobCount = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open', isApproved: true });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const jobsToday = await Job.countDocuments({ createdAt: { $gte: today } });
    
    const applicationCount = await Application.countDocuments();
    const appsToday = await Application.countDocuments({ createdAt: { $gte: today } });
    
    const companyCount = await Company.countDocuments();

    // Get recent activities
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).select('fullname email role createdAt');
    const recentJobs = await Job.find({}).sort({ createdAt: -1 }).limit(5).populate('company', 'name');
    const recentApplications = await Application.find({}).sort({ createdAt: -1 }).limit(5).populate('job', 'title').populate('applicant', 'fullname');

    res.json({
      totals: {
        users: userCount,
        recruiters: recruiterCount,
        admins: adminCount,
        jobs: jobCount,
        activeJobs,
        closedJobs,
        jobsToday,
        applications: applicationCount,
        appsToday,
        companies: companyCount,
      },
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
    const { page = 1, limit = 10, search = '', role = 'all' } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: `User role updated to ${role}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user block status
// @route   PUT /api/admin/users/:id/block
const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    next(error);
  }
};

// --- Job Management ---

// @desc    Get all jobs with search, filter, and pagination
// @route   GET /api/admin/jobs
const getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('company', 'name')
      .populate('created_by', 'fullname')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalJobs: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle job approval
// @route   PUT /api/admin/jobs/:id/approve
const toggleJobApproval = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.isApproved = !job.isApproved;
    await job.save();
    res.json({ message: `Job ${job.isApproved ? 'approved' : 'rejected'}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle featuring a job
// @route   PUT /api/admin/jobs/:id/feature
const toggleJobFeatured = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.isFeatured = !job.isFeatured;
    await job.save();
    res.json({ message: `Job ${job.isFeatured ? 'featured' : 'unfeatured'}` });
  } catch (error) {
    next(error);
  }
};

// --- Other Management ---

const getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({})
      .populate('job', 'title')
      .populate('applicant', 'fullname email')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({}).populate('userId', 'fullname email').sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

// @desc    Manage Support Messages
const getMessages = async (req, res, next) => {
  try {
    const messages = await Support.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const resolveMessage = async (req, res, next) => {
  try {
    const msg = await Support.findById(req.params.id);
    if(msg) {
      msg.status = 'resolved';
      await msg.save();
      res.json({ message: 'Message marked as resolved' });
    }
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await Job.deleteOne({ _id: job._id });
      res.json({ message: 'Job removed' });
    } else {
      res.status(404);
      throw new Error('Job not found');
    }
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (company) {
      await Company.deleteOne({ _id: company._id });
      await Job.deleteMany({ company: company._id });
      res.json({ message: 'Company and its jobs removed' });
    } else {
      res.status(404);
      throw new Error('Company not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
