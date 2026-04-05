const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    amount: {
      type: Number,
      required: true
    },
    planName: {
      type: String,
      required: true,
      enum: ['Basic', 'Premium', 'Pro', 'Enterprise'],
      default: 'Basic'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    paymentMethod: {
      type: String,
      default: 'UPI'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
