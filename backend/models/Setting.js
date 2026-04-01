const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  registrationOpen: {
    type: Boolean,
    default: true
  },
  autoVerifyEmployers: {
    type: Boolean,
    default: true
  },
  jobModeration: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  platformFee: {
    type: String,
    default: '0'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  adminEmail: {
    type: String,
    default: 'admin@toolsjobs.com'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure only one settings document exists
settingSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
