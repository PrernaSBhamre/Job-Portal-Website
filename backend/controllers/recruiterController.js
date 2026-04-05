const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get recruiter dashboard statistics
// @route   GET /api/recruiter/stats
// @access  Private/Recruiter
const getRecruiterStats = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // Get company owned by this recruiter
    const company = await Company.findOne({ userId: recruiterId });
    if (!company) {
      return res.status(200).json({
        success: true,
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplicants: 0,
          applicantsToday: 0
        },
        message: 'No company profile found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Totals
    const totalJobs = await Job.countDocuments({ created_by: recruiterId });
    const activeJobs = await Job.countDocuments({ created_by: recruiterId, status: 'approved' });
    
    // Get all job IDs for this recruiter
    const jobs = await Job.find({ created_by: recruiterId }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });
    const applicantsToday = await Application.countDocuments({ 
      job: { $in: jobIds },
      createdAt: { $gte: today }
    });
    const shortlistedCount = await Application.countDocuments({ 
      job: { $in: jobIds },
      status: 'Shortlisted'
    });

    // Chart Data: Applicants per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applicantTrends = await Application.aggregate([
      {
        $match: {
          job: { $in: jobIds },
          createdAt: { $gte: sevenDaysAgo }
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

    // Job Status Distribution (Pie Chart)
    const jobStatusDist = await Job.aggregate([
      { $match: { created_by: recruiterId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplicants,
        shortlistedCount,
        applicantsToday
      },
      charts: {
        trends: applicantTrends.map(t => ({ date: t._id, count: t.count })),
        jobStatus: jobStatusDist.map(s => ({ type: s._id, value: s.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by the recruiter
// @route   GET /api/recruiter/jobs
// @access  Private/Recruiter
const getRecruiterJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const query = { created_by: req.user._id };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (status !== 'all') {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(query);

    res.status(200).json({
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

// @desc    Update a job post
// @route   PUT /api/recruiter/jobs/:id
// @access  Private/Recruiter
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, created_by: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    // Exclude certain fields from being updated by recruiter
    const { isApproved, applicationsCount, viewsCount, ...updates } = req.body;
    
    Object.assign(job, updates);
    await job.save();

    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/recruiter/jobs/:id/applicants
// @access  Private/Recruiter
const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, created_by: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = { job: req.params.id };
    if (status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('applicant', 'fullname email phoneNumber profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
      jobTitle: job.title,
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

// @desc    Update application status
// @route   PUT /api/recruiter/applications/:id/status
// @access  Private/Recruiter
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if the recruiter owns the job associated with this application
    if (application.job.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    const oldStatus = application.status;
    application.status = status;
    application.statusTimeline.push({
      status: status,
      comment: req.body.comment || `Status updated from ${oldStatus} to ${status}`
    });

    await application.save();

    // Create Notification for the Applicant
    await Notification.create({
      userId: application.applicant,
      message: `Your application status for '${application.job.title}' has been updated to ${status}.`,
      type: 'status_update',
      link: '/user/applications'
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get/Create/Update recruiter's company profile
// @route   GET/PUT /api/recruiter/company
// @access  Private/Recruiter
const manageCompanyProfile = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;
    let company = await Company.findOne({ userId: recruiterId });

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, company });
    }

    if (req.method === 'PUT') {
      if (!company) {
        // Create new company profile
        company = await Company.create({
          ...req.body,
          userId: recruiterId
        });
      } else {
        // Update existing
        Object.assign(company, req.body);
        await company.save();
      }
      return res.status(200).json({ success: true, message: 'Company profile updated', company });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent applications across all jobs for the recruiter
// @route   GET /api/recruiter/recent-applications
// @access  Private/Recruiter
const getRecentApplications = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // Get all job IDs for this recruiter
    const jobs = await Job.find({ created_by: recruiterId }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('applicant', 'fullname email profile')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecruiterStats,
  getRecruiterJobs,
  updateJob,
  getJobApplicants,
  getRecentApplications,
  updateApplicationStatus,
  manageCompanyProfile
};
