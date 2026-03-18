const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUserAccount,
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/:id')
  .get(protect, getUserById)
  .delete(protect, deleteUserAccount);

module.exports = router;
