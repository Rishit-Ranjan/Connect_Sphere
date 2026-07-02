import { Router } from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/me', protect, userController.getMe);
router.get('/', protect, userController.getUsers);
router.patch('/:userId/role', protect, userController.updateUserRole);
router.delete('/:userId', protect, userController.deleteUser);

export default router;