const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    round: {
      type: Number,
      default: 1,
    },
    mode: {
      type: String,
      enum: ['video', 'phone', 'in_person'],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String, // e.g., 'America/New_York'
    },
    locationOrLink: {
      type: String,
      required: true,
    },
    messageToCandidate: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'rescheduled', 'cancelled'],
      default: 'scheduled',
    },
    rescheduleReason: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
