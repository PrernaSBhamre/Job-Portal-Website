const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company must belong to an employer'],
    },
    name: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    logo: {
      type: String, // URL to company logo
    },
    website: {
      type: String,
    },
    industry: { 
      type: String 
    },
    size: { 
      type: String 
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
