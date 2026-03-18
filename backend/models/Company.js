const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a company name'],
      unique: true,
    },
    description: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    logo: {
      type: String, // URL to company logo
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company must belong to a user/recruiter'],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
