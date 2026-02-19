const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['saas', 'trend', 'job', 'tool'],
    required: true
  },
  relevance: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  date: {
    type: String
  },
  url: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
