const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private/Student
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
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
      res.status(400);
      throw new Error('You have already applied for this job');
    }

    // Extract file path from Multer upload
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a resume file (PDF, DOCX).');
    }
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const { coverLetter, fullName, phone, college, graduationYear, portfolio } = req.body;

    // Create the application
    const application = await Application.create({
      job: jobId,
      applicant: userId,
      resume: resumeUrl,
      coverLetter,
      fullName,
      phone,
      college,
      graduationYear,
      portfolio,
      status: 'pending',
    });

    // Push the application ID to the job's applications array
    job.applications.push(application._id);
    await job.save();

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
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Recruiter
const getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Check if the current user is the owner of the job or an admin
    if (job.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view these applications');
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'fullname email phoneNumber profile');

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Recruiter
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const job = await Job.findById(application.job);

    if (!job || (job.created_by.toString() !== req.user.id && req.user.role !== 'admin')) {
      res.status(403);
      throw new Error('Not authorized to update this application');
    }

    application.status = status.toLowerCase();
    const updatedApplication = await application.save();

    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private/Student
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Only the applicant can withdraw
    if (application.applicant.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to withdraw this application');
    }

    const job = await Job.findById(application.job);
    if (job) {
      // Remove application reference from Job
      job.applications = job.applications.filter((appId) => appId.toString() !== application._id.toString());
      await job.save();
    }

    await Application.deleteOne({ _id: application._id });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
  withdrawApplication,
};
