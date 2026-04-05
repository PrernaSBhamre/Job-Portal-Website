const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Schedule a new interview
// @route   POST /api/interviews
// @access  Private/Employer
const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      type,
      date,
      startTime,
      endTime,
      meetingLink,
      location,
      notes
    } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this application' });
    }

    // Following strict path: "shortlisted" -> "interview_scheduled"
    if (application.status !== 'shortlisted' && application.status !== 'interview_scheduled') {
      return res.status(400).json({ 
        message: `Interviews can only be scheduled for shortlisted applicants. Current status: ${application.status}` 
      });
    }

    const interview = await Interview.create({
      applicationId,
      employerId: req.user._id,
      jobId: application.jobId,
      userId: application.userId,
      type,
      date,
      startTime,
      endTime,
      meetingLink,
      location,
      notes,
      status: 'scheduled'
    });

    // Automatically update application status if it's not already interview_scheduled
    if(application.status !== 'interview_scheduled') {
      application.status = 'interview_scheduled';
      application.statusTimeline.push({
        status: 'interview_scheduled',
        date: Date.now()
      });
      await application.save();
    }

    // Notify the applicant
    await Notification.create({
      toUserId: application.userId,
      fromUserId: req.user._id,
      type: 'interview_scheduled',
      relatedJobId: application.jobId,
      message: `An interview has been scheduled for your application. Date: ${date}, Time: ${startTime}`
    });

    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interviews for the employer
// @route   GET /api/interviews/employer
// @access  Private/Employer
const getEmployerInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ employerId: req.user._id })
      .populate('jobId', 'title location type isRemote')
      .populate('userId', 'name email phone profile.resumeUrl')
      .sort({ date: 1, startTime: 1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview status
// @route   PATCH /api/interviews/:id/status
// @access  Private/Employer
const updateInterviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid interview status' });
    }

    interview.status = status;
    const updatedInterview = await interview.save();

    // Notify applicant if cancelled
    if (status === 'cancelled') {
        const application = await Application.findById(interview.applicationId);
        
        await Notification.create({
          toUserId: interview.userId,
          fromUserId: req.user._id,
          type: 'general',
          relatedJobId: interview.jobId,
          message: `Your interview scheduled for ${interview.date} at ${interview.startTime} has been cancelled.`
        });
    }

    // --- Socket.IO Event Delivery ---
    if (req.io) {
        req.io.to(`employer_${interview.employerId.toString()}`).emit('interview_status_changed', {
            interviewId: interview._id,
            status: interview.status
        });
    }

    res.json(updatedInterview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getEmployerInterviews,
  updateInterviewStatus
};
