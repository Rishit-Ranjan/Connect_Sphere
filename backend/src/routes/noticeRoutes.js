
import { Router } from 'express';
import noticeController from '../controllers/noticeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, noticeController.getNotices);
router.post('/', protect, noticeController.createNotice);
router.delete('/:noticeId', protect, noticeController.deleteNotice);

export default router;