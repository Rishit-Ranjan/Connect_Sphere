import { Router } from 'express';
import { getMe, getUsers, updateUserRole, deleteUser } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', protect, getMe);
router.get('/', protect, getUsers);
router.patch('/:userId/role', protect, updateUserRole);
router.delete('/:userId', protect, deleteUser);

export default router;