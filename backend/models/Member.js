const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  constituency: {
    type: String,
    required: true,
    trim: true
  },
  sessionName: {
    type: String,
    required: true,
    trim: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  speechGiven: {
    type: String,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);

