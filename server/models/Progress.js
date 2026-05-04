const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  learningPathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true,
  },
  completedTopics: [{ type: String }],
  // NEW: track exactly WHEN each step was completed for real analytics
  completionLog: [{
    topic: { type: String },
    completedAt: { type: Date, default: Date.now }
  }],
  progressPercentage: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
