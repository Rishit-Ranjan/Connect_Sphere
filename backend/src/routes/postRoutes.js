import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Router } from 'express';
import multer from 'multer';
import postController from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { POST_IMAGES_DIR } from '../config/uploads.js';

const router = Router();
const allowedImageTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: POST_IMAGES_DIR,
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
const handlePostImageUpload = (req, res, next) => {
  imageUpload.single('image')(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 413;
    }
    next(error);
  });
};

router.get('/images/:imageName', protect, postController.getPostImage);
router.get('/', protect, postController.getPosts);
router.post('/', protect, handlePostImageUpload, postController.createPost);
router.patch('/:postId/like', protect, postController.toggleLikePost);
router.post('/:postId/comment', protect, postController.addCommentToPost);
router.patch('/:postId/comment/:commentId', protect, postController.updateComment);
router.delete('/:postId/comment/:commentId', protect, postController.deleteComment);
router.delete('/:postId', protect, postController.deletePost);

export default router;