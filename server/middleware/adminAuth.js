const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'supersecret');
    const userId = decoded.id || (decoded.user && decoded.user.id);
    
    if (!userId) {
      return res.status(401).json({ message: 'Token payload invalid' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.log('Invalid admin token:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = adminAuthMiddleware;
