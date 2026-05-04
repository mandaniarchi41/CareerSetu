const Progress = require('../models/Progress');
const LearningPath = require('../models/LearningPath');

// POST /api/progress/update
// Marks a step as completed and saves a real timestamp to MongoDB
exports.updateProgress = async (req, res) => {
  try {
    const { learningPathId, completedTopic, totalSteps } = req.body;
    const userId = req.user.id;

    if (!learningPathId || !completedTopic) {
      return res.status(400).json({ message: 'learningPathId and completedTopic are required' });
    }

    // Find or create the progress document for this user + path
    let progress = await Progress.findOne({ userId, learningPathId });

    if (!progress) {
      progress = new Progress({
        userId,
        learningPathId,
        completedTopics: [],
        completionLog: [],
        progressPercentage: 0,
      });
    }

    // Only add if not already completed (idempotent)
    if (!progress.completedTopics.includes(completedTopic)) {
      progress.completedTopics.push(completedTopic);
      progress.completionLog.push({ topic: completedTopic, completedAt: new Date() });
    }

    // Calculate real progress percentage
    const total = totalSteps || progress.completedTopics.length;
    progress.progressPercentage = total > 0
      ? Math.min(100, Math.round((progress.completedTopics.length / total) * 100))
      : 0;

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error('Progress Update Error:', err);
    res.status(500).json({ message: 'Error updating progress', error: err.message });
  }
};

// GET /api/progress
// Returns all progress records for the logged-in user
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await Progress.find({ userId }).populate('learningPathId', 'goal phases currentLevel');
    res.json(progress);
  } catch (err) {
    console.error('Get Progress Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
