import { Router } from 'express';
import postController from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, postController.getPosts);
router.post('/', protect, postController.createPost);
router.patch('/:postId/like', protect, postController.toggleLikePost);
router.post('/:postId/comment', protect, postController.addCommentToPost);
router.delete('/:postId', protect, postController.deletePost);

export default router;