const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phoneNumber: {
      type: Number,
      required: [true, 'Please add a phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      required: [true, 'Please select a role']
    },
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String }, // URL to resume file
      resumeOriginalName: { type: String },
      company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // For recruiters
      profilePhoto: {
        type: String,
        default: ""
      },
      education: [{
        institution: String,
        degree: String,
        startYear: String,
        endYear: String,
        grade: String
      }],
      experience: [{
        company: String,
        title: String,
        description: String,
        startDate: String,
        endDate: String,
        isCurrent: Boolean
      }],
      socialLinks: {
        linkedIn: String,
        github: String,
        portfolio: String
      },
      preferences: {
        expectedSalary: String,
        willingnessToRelocate: { type: Boolean, default: false },
        preferredLocations: [{ type: String }]
      }
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await require('bcrypt').genSalt(10);
  this.password = await require('bcrypt').hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await require('bcrypt').compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
