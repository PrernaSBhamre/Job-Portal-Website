const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Optional, could be system generated
    },
    type: {
      type: String,
      enum: [
        'new_application', 
        'application_withdrawn', 
        'interview_confirmed', 
        'reschedule_requested', 
        'job_approved', 
        'job_rejected', 
        'account_blocked',
        'application_shortlisted', // for job seeker
        'application_rejected', // for job seeker
        'interview_scheduled' // for job seeker
      ],
      required: true
    },
    relatedJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    relatedApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    relatedInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
