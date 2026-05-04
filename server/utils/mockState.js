const mockProfiles = {};
const mockProgress = {};
const mockPathHistory = {};
const mockPlanner = {};

exports.getMockPlanner = (userId, date) => {
  const key = `${userId}_${date}`;
  if (!mockPlanner[key]) {
    mockPlanner[key] = {
      userId,
      date,
      tasks: [
        { id: 't1', title: 'Morning Review', type: 'Review', time: '09:00 AM', done: false },
        { id: 't2', title: 'Deep Work Session', type: 'Code', time: '11:00 AM', done: false }
      ]
    };
  }
  return mockPlanner[key];
};

exports.updateMockPlanner = (userId, date, taskId, data) => {
  const key = `${userId}_${date}`;
  const plan = exports.getMockPlanner(userId, date);
  
  if (taskId) {
    // Update existing task
    const task = plan.tasks.find(t => t.id === taskId);
    if (task) Object.assign(task, data);
  } else {
    // Add new task
    const newTask = {
      id: `t_${Date.now()}`,
      ...data
    };
    plan.tasks.push(newTask);
  }
  
  mockPlanner[key] = plan;
  return plan;
};

exports.overwriteMockPlanner = (userId, date, tasks) => {
  const key = `${userId}_${date}`;
  mockPlanner[key] = { userId, date, tasks };
  return mockPlanner[key];
};

exports.savePathToHistory = (userId, path) => {
  if (!mockPathHistory[userId]) mockPathHistory[userId] = [];
  // Only add if not already in history (basic check by goal)
  if (!mockPathHistory[userId].find(p => p.goal === path.goal)) {
    mockPathHistory[userId].unshift({ ...path, createdAt: new Date() });
  }
};

exports.getPathHistory = (userId) => {
  return mockPathHistory[userId] || [];
};

exports.getMockProfile = (userId) => {
  return mockProfiles[userId] || {
    userId,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Git'],
    experience: '3 years of web development',
    education: 'Bachelor in Computer Science',
    extractedFrom: 'Manual'
  };
};

exports.updateMockProfile = (userId, data) => {
  mockProfiles[userId] = { ...exports.getMockProfile(userId), ...data };
  return mockProfiles[userId];
};

exports.getMockProgress = (userId, pathId) => {
  const key = `${userId}_${pathId}`;
  return mockProgress[key] || {
    userId,
    learningPathId: pathId,
    completedTopics: [],
    progressPercentage: 0
  };
};

exports.updateMockProgress = (userId, pathId, completedTopic, totalSteps = 4) => {
  const key = `${userId}_${pathId}`;
  const current = exports.getMockProgress(userId, pathId);
  
  if (!current.completedTopics.includes(completedTopic)) {
    current.completedTopics.push(completedTopic);
  }
  
  // Dynamic calculation based on total steps
  current.progressPercentage = Math.round((current.completedTopics.length / totalSteps) * 100);
  if (current.progressPercentage > 100) current.progressPercentage = 100;
  
  mockProgress[key] = current;
  return current;
};
