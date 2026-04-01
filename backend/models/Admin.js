const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'admin'
    },
    fullname: {
      type: String,
      default: 'System Admin'
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await require('bcrypt').genSalt(10);
  this.password = await require('bcrypt').hash(this.password, salt);
});

// Match user entered password to hashed password in database
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await require('bcrypt').compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
