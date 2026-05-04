const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: 'Study' },
  time: { type: String, default: '09:00 AM' },
  done: { type: Boolean, default: false }
});

const studyPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  tasks: [taskSchema]
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
