const User = require('../models/User');

// @desc    Get user profile (Current logged in user profile)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.fullname = req.body.fullname || user.fullname;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

      // Update nested profile object
      if (req.body.profile) {
        user.profile.bio = req.body.profile.bio !== undefined ? req.body.profile.bio : user.profile.bio;
        user.profile.skills = req.body.profile.skills || user.profile.skills;
        user.profile.resume = req.body.profile.resume || user.profile.resume;
        user.profile.resumeOriginalName = req.body.profile.resumeOriginalName || user.profile.resumeOriginalName;
        user.profile.profilePhoto = req.body.profile.profilePhoto || user.profile.profilePhoto;
        user.profile.education = req.body.profile.education || user.profile.education;
        user.profile.experience = req.body.profile.experience || user.profile.experience;
        
        if (req.body.profile.socialLinks) {
           user.profile.socialLinks = { ...user.profile.socialLinks, ...req.body.profile.socialLinks };
        }
        if (req.body.profile.preferences) {
           user.profile.preferences = { ...user.profile.preferences, ...req.body.profile.preferences };
        }
      }

      // If email is being changed, check if it's already taken
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          res.status(400);
          throw new Error('Email already in use');
        }
        user.email = req.body.email;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
const deleteUserAccount = async (req, res, next) => {
  try {
    // Only allow admin or the user themselves to delete
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        res.status(403);
        throw new Error('Not authorized to delete this account');
    }

    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUserAccount,
};
