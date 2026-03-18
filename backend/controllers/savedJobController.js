const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Save/Bookmark a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private
const saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const alreadySaved = await SavedJob.findOne({ user: userId, job: jobId });
    if (alreadySaved) {
      res.status(400);
      throw new Error('Job already saved');
    }

    const savedJob = await SavedJob.create({
      user: userId,
      job: jobId,
    });

    res.status(201).json(savedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved jobs
// @route   GET /api/saved-jobs
// @access  Private
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo location'
        }
      })
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private
const removeSavedJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    const savedJob = await SavedJob.findOne({ user: userId, job: jobId });

    if (!savedJob) {
      res.status(404);
      throw new Error('Saved job not found');
    }

    await SavedJob.deleteOne({ _id: savedJob._id });
    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  removeSavedJob,
};
