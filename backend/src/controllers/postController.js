import { find, create, findById, findByIdAndDelete } from '../models/Post';

const getPosts = async (req, res, next) => {
  try {
    const posts = await find()
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

    const post = await create({
      author: req.user._id,
      text: text.trim(),
      imageUrl: imageUrl || ''
    });

    const populatedPost = await findById(post._id)
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

const toggleLikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await findById(postId);

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

    const post = await findById(postId);

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
    const updatedPost = await findById(postId)
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

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isAuthor =
      post.author.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    await findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully.', postId });
  } catch (error) {
    next(error);
  }
};

export default { 
  getPosts, 
  createPost, 
  toggleLikePost, 
  addCommentToPost,
  deletePost 
};