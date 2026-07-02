// routes/roomRoutes.js
import { Router } from 'express';
import roomController from '../controllers/roomController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', protect, roomController.createRoom);
router.get('/', protect, roomController.getRooms);
router.get('/:roomId/messages', protect, roomController.getRoomMessages);
router.post('/:roomId/messages', protect, roomController.createRoomMessage);

export default router;