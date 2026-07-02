// routes/directMessageRoutes.js
import { Router } from 'express';
import { getDirectMessages, createDirectMessage } from '../controllers/directMessageController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getDirectMessages);
router.post('/', protect, createDirectMessage);

export default router;