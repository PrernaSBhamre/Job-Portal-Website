const Job = require('../models/Job');

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private/Recruiter
const createJob = async (req, res, next) => {
  try {
    const { title, description, requirements, salary, experienceLevel, location, jobType, position, tags, company } = req.body;

    const job = await Job.create({
      title,
      description,
      requirements,
      salary,
      experienceLevel,
      location,
      jobType,
      position,
      tags,
      company,
      created_by: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available jobs (with search/filters)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { keyword, location, type, salary } = req.query;

    let query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.jobType = { $regex: type, $options: 'i' };
    }

    if (salary) {
      query.salary = { $regex: salary, $options: 'i' };
    }

    // Populate company details needed for UI
    const jobs = await Job.find(query)
      .populate('company', 'name logo location')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific job details
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('created_by', 'fullname email profile');

    if (job) {
      res.json(job);
    } else {
      res.status(404);
      throw new Error('Job not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update job information
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      // Allow if admin or if recruiter owns the job
      if (job.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this job');
      }

      job.title = req.body.title || job.title;
      job.description = req.body.description || job.description;
      job.requirements = req.body.requirements || job.requirements;
      job.salary = req.body.salary || job.salary;
      job.experienceLevel = req.body.experienceLevel || job.experienceLevel;
      job.location = req.body.location || job.location;
      job.jobType = req.body.jobType || job.jobType;
      job.position = req.body.position || job.position;
      job.tags = req.body.tags || job.tags;

      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404);
      throw new Error('Job not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job listing
// @route   DELETE /api/jobs/:id
// @access  Private/Recruiter
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this job');
      }

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

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
