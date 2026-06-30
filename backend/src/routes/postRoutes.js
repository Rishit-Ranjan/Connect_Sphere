const express = require('express');
const {
  getPosts,
  createPost,
  toggleLikePost,
  addCommentToPost,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.patch('/:postId/like', protect, toggleLikePost);
router.post('/:postId/comment', protect, addCommentToPost);
router.delete('/:postId', protect, deletePost);

module.exports = router;