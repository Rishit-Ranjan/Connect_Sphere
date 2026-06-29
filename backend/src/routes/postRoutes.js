const express = require('express');
const { getPosts, createPost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);

module.exports = router;