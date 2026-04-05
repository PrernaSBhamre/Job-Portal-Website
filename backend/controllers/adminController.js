const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Support = require('../models/Support');
const Resource = require('../models/Resource');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

// Helper to log admin actions
const logAdminAction = async (req, action, targetType, targetId, description) => {
  try {
    await AuditLog.create({
      adminId: req.user?._id,
      action,
      targetType,
      targetId,
      description,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

/**
 * @desc    Automated Fraud Detection Engine
 * Checks for patterns like application spam, fake jobs, or high report counts
 */
const runFraudDetection = async () => {
  const flags = {
    suspiciousUsers: [],
    suspiciousJobs: [],
  };

  try {
    // Rule 1: High Report Count (> 5) -> auto-flag user
    const highlyReportedUsers = await User.find({ reportCount: { $gt: 5 }, isSuspicious: false });
    for (const user of highlyReportedUsers) {
      user.isSuspicious = true;
      user.suspensionReason = "Automated Flag: High report count (>5)";
      await user.save();
      flags.suspiciousUsers.push(user._id);
    }

    // Rule 2: Employer posting too many jobs (> 10 in 24h) -> flag employer
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const aggressiveEmployers = await Job.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: "$created_by", count: { $sum: 1 } } },
      { $match: { count: { $gt: 10 } } }
    ]);

    for (const emp of aggressiveEmployers) {
      const user = await User.findById(emp._id);
      if (user && !user.isSuspicious) {
        user.isSuspicious = true;
        user.suspensionReason = `Automated Flag: Rapid job posting (${emp.count} in 24h)`;
        await user.save();
        flags.suspiciousUsers.push(user._id);
      }
    }

    // Rule 3: Job with missing company data or suspicious keywords
    const suspiciousKeywords = ['urgent money', 'whatsapp only', 'pay to join'];
    const suspiciousJobs = await Job.find({
      $or: [
        { description: { $regex: suspiciousKeywords.join('|'), $options: 'i' } },
        { eligibility: { $regex: suspiciousKeywords.join('|'), $options: 'i' } }
      ],
      isSuspicious: false
    });

    for (const job of suspiciousJobs) {
      job.isSuspicious = true;
      await job.save();
      flags.suspiciousJobs.push(job._id);
    }

    return flags;
  } catch (err) {
    console.error('Fraud Detection Error:', err);
    return flags;
  }
};

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
    const unresolvedReports = await Support.countDocuments({ status: 'unresolved' });
    const suspiciousUsersCount = await User.countDocuments({ isSuspicious: true });
    const suspiciousJobsCount = await Job.countDocuments({ isSuspicious: true });

    // Revenue Calculation (Mock/Real from Transactions)
    const revenueStats = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    const todayRevenueStats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenueToday = todayRevenueStats.length > 0 ? todayRevenueStats[0].total : 0;

    // Growth Trends (Last 7 days)
    const last7Days = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
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

    // Run Automated Fraud Detection
    const fraudFlags = await runFraudDetection();

    // Action Queue Data (Pending specific actions)
    const actionQueue = {
      pendingJobs: await Job.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).populate('company', 'name'),
      pendingReports: await Support.find({ status: 'unresolved' }).sort({ createdAt: -1 }).limit(10),
      flaggedUsers: await User.find({ isSuspicious: true }).limit(10).select('fullname email suspensionReason'),
    };

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
        verifiedCompanies,
        resources: resourceCount,
        unresolvedReports,
        suspiciousUsers: suspiciousUsersCount,
        suspiciousJobs: suspiciousJobsCount,
        totalRevenue,
        revenueToday
      },
      trends: last7Days,
      roleDistribution: roleDist,
      recent: {
        users: recentUsers,
        jobs: recentJobs,
        applications: recentApplications,
        unresolvedReports: await Support.find({ status: 'unresolved' }).sort({ createdAt: -1 }).limit(5)
      },
      actionQueue,
      fraudDetection: {
        newlyFlaggedUsers: fraudFlags.suspiciousUsers.length,
        newlyFlaggedJobs: fraudFlags.suspiciousJobs.length
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
    
    // Log Activity
    await logAdminAction(req, 'update_user_status', 'User', user._id, `Updated status for ${user.fullname}: Verified=${isVerified}, Blocked=${isBlocked}, Role=${role}`);

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

    if (status !== undefined) {
      job.status = status;
      if (status === 'approved') {
        job.isApproved = true;
      }
    }
    if (isFeatured !== undefined) job.isFeatured = isFeatured;

    await job.save();

    // Log Activity
    await logAdminAction(req, 'update_job_status', 'Job', job._id, `Updated job '${job.title}' status to ${status}, featured=${isFeatured}`);

    // Create Notification for the Job Owner (Employer)
    if (status === 'approved') {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: job.created_by,
        message: `Your job post '${job.title}' has been approved by the admin and is now live!`,
        type: 'job_approval',
        link: '/employer/jobs'
      });
    }

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
    
    // Log Activity
    await logAdminAction(req, 'update_company_status', 'Company', company._id, `Updated verification status for ${company.name} to ${isVerified}`);

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
    
    const userName = user.fullname;
    await User.deleteOne({ _id: user._id });
    
    // Log Activity
    await logAdminAction(req, 'delete_user', 'User', user._id, `Deleted user account: ${userName} (${user.email})`);

    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    const jobTitle = job.title;
    await Job.deleteOne({ _id: job._id });
    
    // Log Activity
    await logAdminAction(req, 'delete_job', 'Job', job._id, `Deleted job post: ${jobTitle}`);

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
    
    // Log Activity
    await logAdminAction(req, 'update_resource', 'Resource', resource._id, `Updated resource: ${resource.title}`);

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
    
    const title = resource.title;
    await resource.deleteOne();
    
    // Log Activity
    await logAdminAction(req, 'delete_resource', 'Resource', resource._id, `Deleted resource: ${title}`);

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

// --- Settings Management ---

// @desc    Get system settings
// @route   GET /api/admin/settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSingleton();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};
// @desc    Update system settings
// @route   PUT /api/admin/settings
const updateSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true
    });

    // Log Activity
    await logAdminAction(req, 'update_settings', 'Setting', settings._id, 'Updated system-wide settings');

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    next(error);
  }
};

// --- Action Queue Resolutions ---

// @desc    Resolve a support report
// @route   PUT /api/admin/reports/:id/resolve
const resolveReport = async (req, res, next) => {
  try {
    const report = await Support.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = 'resolved';
    await report.save();

    // Log Activity
    await logAdminAction(req, 'resolve_report', 'Report', report._id, `Resolved support report: ${report.subject}`);

    res.json({ success: true, message: 'Report marked as resolved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user suspicious flag
// @route   PUT /api/admin/users/:id/flag
const toggleUserFlag = async (req, res, next) => {
  try {
    const { isSuspicious, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isSuspicious = isSuspicious;
    if (reason) user.suspensionReason = reason;
    
    await user.save();

    // Log Activity
    await logAdminAction(req, 'toggle_user_flag', 'User', user._id, `${isSuspicious ? 'Flagged' : 'Unflagged'} user account: ${user.fullname}. Reason: ${reason || 'N/A'}`);

    res.json({ success: true, message: `User ${isSuspicious ? 'flagged' : 'unflagged'} successfully`, user });
  } catch (error) {
    next(error);
  }
};



// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = await AuditLog.find()
      .populate('adminId', 'fullname email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalLogs: count
      }
    });
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
  changeAdminPassword,
  getSettings,
  updateSettings,
  resolveReport,
  toggleUserFlag,
  getAuditLogs
};
