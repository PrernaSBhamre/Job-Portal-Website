const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/mine')
  .get(getMyNotifications);

router.route('/:id/read')
  .patch(markAsRead);

module.exports = router;
