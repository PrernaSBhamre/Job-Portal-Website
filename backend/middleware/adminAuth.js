const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobportal_secret_2024');

      // 1. Try finding in Admin model first (Dedicated Admin table)
      let user = await Admin.findById(decoded.id).select('-password');
      
      // 2. If not found in Admin table, check User table with admin role
      if (!user) {
        user = await User.findById(decoded.id).select('-password');
        if (!user || user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Not authorized as an admin',
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

module.exports = { adminProtect };
