import { Router } from 'express';
import notificationController from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, notificationController.getStatuses);
router.patch('/', protect, notificationController.updateStatuses);

export default router;
