import { Router } from 'express';
import { getPosts, createPost, toggleLikePost, addCommentToPost, deletePost } from '../controllers/postController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.patch('/:postId/like', protect, toggleLikePost);
router.post('/:postId/comment', protect, addCommentToPost);
router.delete('/:postId', protect, deletePost);

export default router;