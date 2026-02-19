const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  stage: {
    type: String,
    enum: ['idea', 'mvp', 'shipped'],
    default: 'idea'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  repo: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);
