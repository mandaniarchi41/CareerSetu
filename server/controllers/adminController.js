const User = require('../models/User');
const Profile = require('../models/Profile');
const LearningPath = require('../models/LearningPath');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const totalLearningPaths = await LearningPath.countDocuments();
    
    // Get latest users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    
    res.json({
      stats: {
        users: totalUsers,
        profiles: totalProfiles,
        learningPaths: totalLearningPaths
      },
      recentUsers
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getAllLearningPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(paths);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching learning paths' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Profile.findOneAndDelete({ userId: req.params.id });
    await LearningPath.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role' });
  }
};

exports.deleteLearningPath = async (req, res) => {
  try {
    await LearningPath.findByIdAndDelete(req.params.id);
    res.json({ message: 'Learning path deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting learning path' });
  }
};
