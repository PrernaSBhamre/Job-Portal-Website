const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

const Admin = require('../models/Admin');

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    // 1. Intercept Admin logins first
    const adminUser = await Admin.findOne({ email });
    
    if (adminUser) {
        console.log('Found admin user in database...');
        const isMatch = await adminUser.matchPassword(password);
        if (isMatch) {
            console.log('Admin password verified!');
            return res.json({
                _id: adminUser._id,
                fullname: 'System Admin',
                email: adminUser.email,
                role: 'admin',
                token: generateToken(adminUser._id),
            });
        } else {
            console.log('Admin password Mismatch!');
            res.status(401);
            throw new Error('Invalid email or password');
        }
    }

    // 2. Normal User logins
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      console.log(`User ${user.role} login success: ${email}`);
      res.json({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.log(`Login failed for: ${email} (User not found or password wrong)`);
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie or token state (client side usually)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    // In JWT, logout is often handled client-side by destroying the token
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401);
      throw new Error('Invalid old password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      throw new Error('There is no registered account with that email.');
    }

    // Get cryptographic reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a production environment with SMTP, this would be routed via nodemailer.
    // Here, we simulate the email receipt by passing it in the JSON for the frontend to digest.
    res.status(200).json({
      success: true,
      message: 'Token generated successfully. Check the console or use the direct link to reset your password.',
      resetToken
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    
    // Compare hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Token is invalid or has expired.');
    }

    // Safely enforce new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
       success: true,
       message: 'Password reset accomplished securely. Proceed to login.',
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword
};
