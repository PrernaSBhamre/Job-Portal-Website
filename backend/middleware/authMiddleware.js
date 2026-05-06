const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      let user = await User.findById(decoded.id).select('-password');
      if (!user) {
          const Admin = require('../models/Admin');
          user = await Admin.findById(decoded.id).select('-password');
      }

      if (user && user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isRecruiter = (req, res, next) => {
  if (req.user && (req.user.role === 'recruiter' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a recruiter' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const isEmployer = (req, res, next) => {
  if (req.user && (req.user.role === 'employer' || req.user.role === 'recruiter')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a recruiter' });
  }
};

module.exports = { protect, isRecruiter, isAdmin, isEmployer };
