
import { Router } from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getNotices);
router.post('/', protect, createNotice);
router.delete('/:noticeId', protect, deleteNotice);

export default router;