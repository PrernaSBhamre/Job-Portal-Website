const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res, next) => {
  try {
    const employerId = req.user._id;

    // RULE: Check if employer has a company
    const company = await Company.findOne({ employerId });
    if (!company) {
      return res.status(403).json({ message: 'Create company profile first' });
    }

    const {
      title, description, category, type, location, isRemote,
      skills, experienceRequired, educationRequired, salaryMin,
      salaryMax, salaryNegotiable, openings, deadline, screeningQuestions
    } = req.body;

    const job = await Job.create({
      employerId,
      companyId: company._id,
      title,
      description,
      category,
      type,
      location,
      isRemote,
      skills,
      experienceRequired,
      educationRequired,
      salaryMin,
      salaryMax,
      salaryNegotiable,
      openings,
      deadline,
      screeningQuestions,
      isApproved: false, // Strict default
      isActive: true,
      isPaused: false,
      isClosed: false
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs created by the employer
// @route   GET /api/jobs/mine
// @access  Private/Employer
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific job details
// @route   GET /api/jobs/:id
// @access  Private/Employer
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Role strict check: Ensure employer owns this job
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this job' });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update job information
// @route   PUT /api/jobs/:id
// @access  Private/Employer
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      title, description, category, type, location, isRemote,
      skills, experienceRequired, educationRequired, salaryMin,
      salaryMax, salaryNegotiable, openings, deadline, screeningQuestions
    } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.category = category || job.category;
    job.type = type || job.type;
    job.location = location || job.location;
    job.isRemote = isRemote !== undefined ? isRemote : job.isRemote;
    job.skills = skills || job.skills;
    job.experienceRequired = experienceRequired || job.experienceRequired;
    job.educationRequired = educationRequired || job.educationRequired;
    job.salaryMin = salaryMin || job.salaryMin;
    job.salaryMax = salaryMax || job.salaryMax;
    job.salaryNegotiable = salaryNegotiable !== undefined ? salaryNegotiable : job.salaryNegotiable;
    job.openings = openings || job.openings;
    job.deadline = deadline || job.deadline;
    job.screeningQuestions = screeningQuestions || job.screeningQuestions;

    // Wait, requirement: Employer edits an approved job → isApproved resets to false
    if (job.isApproved === true) {
      job.isApproved = false;
      
      // Notify employer that job needs re-approval
      await Notification.create({
        toUserId: req.user._id,
        type: 'general',
        relatedJobId: job._id,
        message: `Your edits to "${job.title}" have placed the job back into Pending Approval status.`
      });
    }

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Pause or resume a job
// @route   PATCH /api/jobs/:id/pause
// @access  Private/Employer
const pauseJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    job.isPaused = !job.isPaused; // toggle
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Close a job permanently
// @route   PATCH /api/jobs/:id/close
// @access  Private/Employer
const closeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    job.isClosed = true;
    job.isActive = false;
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job listing
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Edge case handling: Employer deletes job with active applications → applications preserved (isJobDeleted: true), applicants notified via notification
    const activeApplications = await Application.find({ jobId: job._id });
    
    for (const app of activeApplications) {
      app.isJobDeleted = true;
      await app.save();

      // Notify the applicant
      await Notification.create({
        toUserId: app.userId,
        fromUserId: req.user._id,
        type: 'general',
        message: `The job "${job.title}" you applied for has been deleted by the employer.`
      });
    }

    await Job.deleteOne({ _id: job._id });
    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active and approved public jobs
// @route   GET /api/jobs
// @access  Public
const getAllPublicJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {
      isApproved: true,
      isActive: true,
      isClosed: false
    };

    const jobs = await Job.find(query)
      .populate('companyId', 'name logo location industry size description website isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      page,
      pages: Math.ceil(totalJobs / limit),
      jobs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  pauseJob,
  closeJob,
  deleteJob,
  getAllPublicJobs
};
