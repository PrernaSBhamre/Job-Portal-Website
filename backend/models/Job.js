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
    requirements: [{
      type: String,
      required: [true, 'Please add requirements']
    }],
    salary: {
      type: Number,
      required: [true, 'Please add a salary'],
    },
    experienceLevel: {
      type: Number,
      required: [true, 'Please add required experience level in years'],
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
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
