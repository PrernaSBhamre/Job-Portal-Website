const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Denormalized for optimized query access
    },
    resumeSnapshot: {
      type: String,
      required: [true, 'Please attach a resume PDF or DOCX file'],
    },
    screeningAnswers: {
      type: [{
        question: String,
        answer: String
      }]
    },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'rejected', 'interview_scheduled', 'hired'],
      default: 'applied',
    },
    statusTimeline: [
      {
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    employerNotes: {
      type: String, // Private for employer
    },
    isWithdrawn: {
      type: Boolean,
      default: false
    },
    withdrawnAt: {
      type: Date
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    isJobDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Prevent users from submitting multiple applications to the exact same job
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
