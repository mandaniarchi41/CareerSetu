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

exports.generateDay = async (req, res) => {
  const { date } = req.body;
  try {
    const { overwriteMockPlanner } = require('../utils/mockState');
    const tasks = [
      { id: `t_${Date.now()}_1`, title: 'Review Previous Concepts', type: 'Review', time: '09:00 AM', done: false },
      { id: `t_${Date.now()}_2`, title: 'Complete Next Module', type: 'Study', time: '10:30 AM', done: false },
      { id: `t_${Date.now()}_3`, title: 'Hands-on Project Work', type: 'Code', time: '02:00 PM', done: false },
      { id: `t_${Date.now()}_4`, title: 'Quiz & Self-Assessment', type: 'Test', time: '04:30 PM', done: false }
    ];
    const plan = overwriteMockPlanner(req.user.id, date, tasks);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error generating tasks' });
  }
};
