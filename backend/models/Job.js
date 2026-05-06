const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
    },
    type: {
      type: String, // e.g. Full-Time, Part-Time
    },
    location: {
      type: String,
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    skills: [{
      type: String
    }],
    experienceRequired: {
      type: String,
    },
    educationRequired: {
      type: String,
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    salaryNegotiable: {
      type: Boolean,
      default: false
    },
    openings: {
      type: Number,
      required: true
    },
    deadline: {
      type: Date
    },
    screeningQuestions: {
      type: [{
        question: String,
        required: Boolean
      }],
      validate: [val => val.length <= 3, '{PATH} exceeds the limit of 3']
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    isClosed: {
      type: Boolean,
      default: false
    },
    applicationsCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    reportCount: {
      type: Number,
      default: 0
    },
    isSuspicious: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'closed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
