const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please add a resource title'] },
    category: { type: String, required: [true, 'Please add a category (e.g., Interview Prep, Career Advice)'] },
    readTime: { type: String, required: [true, 'Please add a read time (e.g., 5 min read)'] },
    content: { type: String, required: [true, 'Please add the content of the resource'] },
    author: { type: String, default: 'FresherHub Editorial' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
