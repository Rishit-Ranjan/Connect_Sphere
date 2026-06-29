const Post = require('../models/Post');

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name handle email role department bio avatarUrl')
      .populate('comments.user', 'name handle avatarUrl')
      .sort({ createdAt: -1 });

    const normalizedPosts = posts.map((post) => ({
      id: post._id,
      text: post.text,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      likedByMe: post.likes.some(
        (userId) => userId.toString() === req.user._id.toString()
      ),
      author: post.author,
      comments: post.comments.map((comment) => ({
        id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        author: comment.user
      }))
    }));

    res.json(normalizedPosts);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { text, imageUrl } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Post text is required.' });
    }

    const post = await Post.create({
      author: req.user._id,
      text: text.trim(),
      imageUrl: imageUrl || ''
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name handle email role department bio avatarUrl')
      .populate('comments.user', 'name handle avatarUrl');

    res.status(201).json({
      id: populatedPost._id,
      text: populatedPost.text,
      imageUrl: populatedPost.imageUrl,
      createdAt: populatedPost.createdAt,
      likesCount: 0,
      likedByMe: false,
      author: populatedPost.author,
      comments: []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, createPost };