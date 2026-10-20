import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.registerUser);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.loginUser);

export default router;