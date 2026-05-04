const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'supersecret');
    
    // Support both new { id: ... } and old { user: { id: ... } } JWT payloads
    req.user = { id: decoded.id || (decoded.user && decoded.user.id) };
    
    if (!req.user.id) {
      return res.status(401).json({ message: 'Token payload invalid' });
    }
    
    next();
  } catch (err) {
    console.log('Invalid token:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
