const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  phases: [{
    phase: { type: String, required: true }, // e.g., Beginner, Intermediate, Advanced
    steps: [{
      title: String,
      description: String,
      estimatedTime: String,
      difficulty: String,
      project: String,
      resources: [{
        title: String,
        link: String,
        type: { type: String } // e.g., 'video', 'article', 'course'
      }]
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
