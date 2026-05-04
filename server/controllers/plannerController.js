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
    const { generateDailyTasksPrompt } = require('../utils/openai');
    const LearningPath = require('../models/LearningPath');
    
    // Fetch user's latest learning path to get their current goal
    const paths = await LearningPath.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const goal = paths.length > 0 ? paths[0].goal : 'Professional Growth';
    
    // Call AI to generate tasks
    let aiTasks = await generateDailyTasksPrompt(date, goal);
    
    // Map tasks to include unique IDs and done status
    const tasks = aiTasks.map((t, index) => ({
      id: `t_${Date.now()}_${index}`,
      title: t.title,
      type: t.type,
      time: t.time,
      done: false
    }));

    const plan = overwriteMockPlanner(req.user.id, date, tasks);
    res.json(plan);
  } catch (err) {
    console.error("Generate Day Error:", err);
    res.status(500).json({ message: 'Error generating tasks' });
  }
};
