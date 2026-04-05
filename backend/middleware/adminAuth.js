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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`[adminProtect] Token verified. Decoded ID: ${decoded.id}`);

      // 1. Try finding in Admin model first
      let user = await Admin.findById(decoded.id).select('-password');
      
      if (user) {
        console.log(`[adminProtect] Found user in Dedicated Admin table: ${user.email}`);
        req.user = user;
        return next();
      }

      // 2. If not found in Admin table, check User table
      console.log(`[adminProtect] User not found in Admin table. Checking User table...`);
      user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.warn(`[adminProtect] REJECTED: User ID ${decoded.id} not found in ANY table.`);
        return res.status(401).json({
          success: false,
          message: 'Account not found. Please login again.',
          code: 'USER_NOT_FOUND'
        });
      }
      
      console.log(`[adminProtect] Found user in User table: ${user.email}, Role: ${user.role}`);
      
      // Case-insensitive role check
      if (!user.role || user.role.toLowerCase() !== 'admin') {
        console.warn(`[adminProtect] REJECTED: User ${user.email} (Role: ${user.role}) attempted admin access`);
        return res.status(403).json({
          success: false,
          message: `Access Denied: You are logged in as ${user.role}, but an admin account is required.`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error(`[adminProtect] Auth Error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
        code: 'TOKEN_INVALID'
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
