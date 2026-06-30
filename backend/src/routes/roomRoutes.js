// routes/roomRoutes.js
const express = require('express');
const {
  getRooms,
  createRoom,
  getRoomMessages,
  createRoomMessage
} = require('../controllers/roomController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/:roomId/messages', protect, getRoomMessages);
router.post('/:roomId/messages', protect, createRoomMessage);

module.exports = router;