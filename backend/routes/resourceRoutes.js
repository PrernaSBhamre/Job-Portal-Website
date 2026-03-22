const express = require('express');
const router = express.Router();
const {
  getResources,
  createResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getResources)
  .post(protect, isAdmin, createResource);

router.route('/:id')
  .delete(protect, isAdmin, deleteResource);

module.exports = router;
