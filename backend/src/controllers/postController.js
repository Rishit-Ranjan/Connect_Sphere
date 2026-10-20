import { open, unlink } from 'fs/promises';
import { basename, join } from 'path';
import Post from '../models/Post.js';
import { POST_IMAGES_DIR } from '../config/uploads.js';

const removeUploadedImage = async (filePath) => {
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const hasValidImageSignature = async (file) => {
  const handle = await open(file.path, 'r');
  try {
    const header = Buffer.alloc(12);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (file.mimetype === 'image/jpeg') {
      return bytesRead >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    }
    if (file.mimetype === 'image/png') {
      return header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    return file.mimetype === 'image/webp' &&
      bytesRead >= 12 &&
      header.toString('ascii', 0, 4) === 'RIFF' &&
      header.toString('ascii', 8, 12) === 'WEBP';
  } finally {
    await handle.close();
  }
};

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

const getPostImage = async (req, res, next) => {
  try {
    const { imageName } = req.params;
    if (
      basename(imageName) !== imageName ||
      !/^[a-f\d-]{36}\.(jpg|jpeg|png|webp)$/i.test(imageName)
    ) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const post = await Post.findOne({ imageName }).select('_id');
    if (!post) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.sendFile(join(POST_IMAGES_DIR, imageName), (error) => {
      if (error?.code === 'ENOENT') {
        if (!res.headersSent) {
          res.status(404).json({ message: 'Image not found.' });
        }
      } else if (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { text, imageUrl } = req.body;

    if (!text || !text.trim()) {
      await removeUploadedImage(req.file?.path);
      return res.status(400).json({ message: 'Post text is required.' });
    }

    if (req.file && !(await hasValidImageSignature(req.file))) {
      await removeUploadedImage(req.file.path);
      return res.status(400).json({ message: 'Uploaded file is not a valid image.' });
    }

    const post = await Post.create({
      author: req.user._id,
      text: text.trim(),
      imageUrl: req.file ? `/api/posts/images/${req.file.filename}` : (imageUrl || ''),
      imageName: req.file?.filename || ''
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
    try {
      await removeUploadedImage(req.file?.path);
    } catch (cleanupError) {
      return next(cleanupError);
    }
    next(error);
  }
};

const toggleLikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if the user already liked the post
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Remove like
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();

    // Return only what App.jsx needs to update local state
    res.json({
      likesCount: post.likes.length,
      likedByMe: !alreadyLiked
    });
  } catch (error) {
    next(error);
  }
};

const addCommentToPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Push new comment to the array
    post.comments.push({
      user: req.user._id,
      text: text.trim()
    });

    await post.save();

    // Re-fetch to populate the comment author's details (avatar, name, etc.)
    const updatedPost = await Post.findById(postId)
      .populate('comments.user', 'name handle avatarUrl');
    
    // Grab the specific comment that was just added
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    // Return formatted comment for App.jsx to append to the UI
    res.status(201).json({
      id: newComment._id,
      text: newComment.text,
      createdAt: newComment.createdAt,
      author: newComment.user
    });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment.' });
    }

    comment.text = text.trim();
    await post.save();

    res.json({
      id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      author: {
        id: req.user._id,
        name: req.user.name,
        handle: req.user.handle,
        avatarUrl: req.user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted successfully.', postId, commentId });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isAuthor =
      post.author.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    await Post.findByIdAndDelete(postId);
    if (post.imageName) {
      await removeUploadedImage(join(POST_IMAGES_DIR, basename(post.imageName)));
    }

    res.json({ message: 'Post deleted successfully.', postId });
  } catch (error) {
    next(error);
  }
};

export default { 
  getPosts,
  getPostImage,
  createPost, 
  toggleLikePost, 
  addCommentToPost,
  updateComment,
  deleteComment,
  deletePost 
};