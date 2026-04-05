const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// --- STUDENT ROUTES ---

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private
const applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    if (!jobId) {
      res.status(400);
      throw new Error('Job ID is required');
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      res.status(400);
      throw new Error('You have already applied for this job');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a resume file (PDF, DOCX).');
    }
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const { coverLetter } = req.body;

    const application = await Application.create({
      jobId,
      userId,
      employerId: job.employerId,
      resumeUrl,
      coverLetter,
      status: 'applied',
      statusTimeline: [
        { status: 'applied', date: Date.now() }
      ]
    });

    // Notify the employer
    await Notification.create({
      toUserId: job.employerId,
      fromUserId: userId,
      type: 'new_application',
      relatedJobId: jobId,
      relatedApplicationId: application._id,
      message: `A new candidate has applied for ${job.title}.`
    });

    // --- Socket.IO Event Delivery ---
    if (req.io) {
        req.io.to(`employer_${job.employerId.toString()}`).emit('application_received', {
            jobId: job._id,
            jobTitle: job.title,
            applicationId: application._id
        });
    }

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve applications submitted by a user
// @route   GET /api/applications/user
// @access  Private
const getAppliedJobs = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Application.deleteOne({ _id: application._id });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};


// --- EMPLOYER ROUTES ---

// @desc    Retrieve applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
const getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot view applicants for a job you do not own' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email profile')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status with strict transitions
// @route   PATCH /api/applications/:id/status
// @access  Private/Employer
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Role strict check: Ensure employer owns this application's associated job
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const currentStatus = application.status;
    const validTransitions = {
      applied: ['viewed'],
      viewed: ['shortlisted', 'rejected'],
      shortlisted: ['interview_scheduled', 'rejected'],
      interview_scheduled: ['hired', 'rejected'],
      hired: [],
      rejected: []
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition. Cannot transition from ${currentStatus} to ${status}` 
      });
    }

    application.status = status;
    application.statusTimeline.push({
      status: status,
      date: Date.now()
    });

    const updatedApplication = await application.save();

    // Create Notification for the Applicant
    await Notification.create({
      toUserId: application.userId,
      fromUserId: req.user._id,
      type: 'application_status',
      relatedJobId: application.jobId,
      relatedApplicationId: application._id,
      message: `Your application status has been updated to ${status}.`
    });

    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getAppliedJobs,
  withdrawApplication,
  getApplicants,
  updateStatus
};
