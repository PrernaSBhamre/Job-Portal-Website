const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const mockSMS = require('../utils/mockSMS');

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
      isVerified: true // Auto-verify on signup
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Account created successfully! You can now login.',
        user: {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
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
      // isVerified check removed for streamlined experience (as requested)
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

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/pages/auth/reset-password.html?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to complete the process:\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Tools and Job - Password Reset Request',
        message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #6d28d9; text-align: center;">Tools and Job</h2>
            <p>Hello ${user.fullname},</p>
            <p>You requested a password reset for your Tools and Job account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #6d28d9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you did not request this, please ignore this email.</p>
            <p>This link will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #777; text-align: center;">© 2026 Tools and Job Global. All rights reserved.</p>
          </div>
        `
      });

      res.status(200).json({
        success: true,
        message: 'A password reset link has been sent to your email.'
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500);
      throw new Error('Email could not be sent. Please try again later.');
    }

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
