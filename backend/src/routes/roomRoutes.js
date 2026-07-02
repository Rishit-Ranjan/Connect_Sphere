// routes/roomRoutes.js
import { Router } from 'express';
import { getRooms, createRoom, getRoomMessages, createRoomMessage } from '../controllers/roomController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/:roomId/messages', protect, getRoomMessages);
router.post('/:roomId/messages', protect, createRoomMessage);

export default router;