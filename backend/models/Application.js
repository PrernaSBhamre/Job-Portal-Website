const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must belong to a job'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a user'],
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interviewing', 'offered', 'rejected'],
      default: 'pending',
    },
    resume: {
      type: String,
      required: [true, 'Please attach a resume PDF or DOCX file'],
    },
    coverLetter: {
      type: String,
    },
    fullName: { type: String },
    phone: { type: String },
    college: { type: String },
    graduationYear: { type: Number },
    portfolio: { type: String }
  },
  { timestamps: true }
);

// Prevent users from submitting multiple applications to the exact same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
