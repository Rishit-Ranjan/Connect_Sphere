// routes/directMessageRoutes.js
import { Router } from 'express';
import directMessageController from '../controllers/directMessageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, directMessageController.getDirectMessages);
router.post('/', protect, directMessageController.createDirectMessage);

export default router;