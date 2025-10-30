const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, 'portfolio_management_secret_key_2025');
    const user = await User.findOne({ userId: decoded.userId });

    if (!user) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid', error: error.message });
  }
};