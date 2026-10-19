import { Router } from 'express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import multer from 'multer';
import userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { AVATARS_DIR } from '../config/uploads.js';

const router = Router();
const allowedImageTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: AVATARS_DIR,
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    if (allowedImageTypes[extension] !== file.mimetype.toLowerCase()) {
      const error = new Error('Choose a JPG, PNG, or WebP image.');
      error.statusCode = 400;
      callback(error);
      return;
    }
    callback(null, true);
  }
});
const handleAvatarUpload = (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 413;
    }
    next(error);
  });
};

router.get('/me', protect, userController.getMe);
router.patch('/me/avatar', protect, userController.updateAvatarPreset);
router.post('/me/avatar/upload', protect, handleAvatarUpload, userController.uploadAvatar);
router.get('/', protect, userController.getUsers);
router.patch('/:userId/role', protect, userController.updateUserRole);
router.delete('/:userId', protect, userController.deleteUser);

export default router;