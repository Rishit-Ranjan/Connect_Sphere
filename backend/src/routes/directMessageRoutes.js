// routes/directMessageRoutes.js
const express = require('express');
const {
  getDirectMessages,
  createDirectMessage
} = require('../controllers/directMessageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getDirectMessages);
router.post('/', protect, createDirectMessage);

module.exports = router;