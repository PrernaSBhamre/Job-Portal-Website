const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    responsibilities: [{
      type: String
    }],
    eligibility: {
      type: String
    },
    perks: [{
      type: String
    }],
    requirements: [{
      type: String,
      required: [true, 'Please add requirements']
    }],
    salary: {
      type: String, // Kept as String to allow "₹4L - ₹6L" ranges from Figma
      required: [true, 'Please add a salary or salary range'],
    },
    experienceLevel: {
      type: String, // Kept as String to allow "0-1 Years" ranges from Figma
      required: [true, 'Please add required experience level'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    jobType: {
      type: String,
      required: [true, 'Please add job type (e.g. Full-Time, Part-Time)'],
    },
    position: {
      type: Number,
      required: [true, 'Please add number of positions available']
    },
    tags: [{
      type: String // To store tags like ["React", "TypeScript", "Tailwind"]
    }],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Job must belong to a company'],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must be created by a user'],
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      }
    ],
    applicationsCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: false
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
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
