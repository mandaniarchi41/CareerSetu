const StudyPlan = require('../models/StudyPlan');
const { getMockPlanner, updateMockPlanner } = require('../utils/mockState');

exports.getTasks = async (req, res) => {
  const { date } = req.query; // Expecting YYYY-MM-DD
  try {
    const plan = getMockPlanner(req.user.id, date);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

exports.updateTask = async (req, res) => {
  const { date, taskId, done } = req.body;
  try {
    const plan = updateMockPlanner(req.user.id, date, taskId, { done });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

exports.addTask = async (req, res) => {
  const { date, title, type, time } = req.body;
  try {
    const plan = updateMockPlanner(req.user.id, date, null, { title, type, time, done: false });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error adding task' });
  }
};
