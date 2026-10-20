import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Resource from '../models/Resource.js';
import DirectMessage from '../models/DirectMessage.js';
import NotificationStatus from '../models/NotificationStatus.js';
import Notice from '../models/Notice.js';
import Room from '../models/Room.js';
import RoomMessage from '../models/RoomMessage.js';
import { AVATARS_DIR, POST_IMAGES_DIR, UPLOADS_DIR } from '../config/uploads.js';

const { compare } = bcrypt;

const removeUploadedFile = async (directory, filename, pattern) => {
  if (!filename || basename(filename) !== filename || !pattern.test(filename)) return;
  try {
    await unlink(join(directory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const allowedAvatarPresets = new Set([
  '/avatars/avatar-blue.svg',
  '/avatars/avatar-green.svg',
  '/avatars/avatar-orange.svg',
  '/avatars/avatar-purple.svg',
  '/avatars/avatar-rose.svg',
  '/avatars/avatar-teal.svg'
]);

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateAvatarPreset = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    if (!allowedAvatarPresets.has(avatarUrl)) {
      return res.status(400).json({ message: 'Choose one of the available avatars.' });
    }

    req.user.avatarUrl = avatarUrl;
    await req.user.save();
    res.json({ avatarUrl: req.user.avatarUrl });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Choose an image to upload.' });
    }

    req.user.avatarUrl = `${req.protocol}://${req.get('host')}/api/users/avatars/${req.file.filename}`;
    await req.user.save();
    res.json({ avatarUrl: req.user.avatarUrl });
  } catch (error) {
    if (req.file) {
      try {
        await unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          return next(cleanupError);
        }
      }
    }
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    const followingIds = new Set((req.user.following || []).map(String));
    const connectionIds = new Set((req.user.connections || []).map(String));
    
    // Normalize _id to id for the frontend
    const normalizedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      role: user.role,
      department: user.department,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      connected: connectionIds.has(String(user._id)),
      following: followingIds.has(String(user._id))
    }));
    
    res.json(normalizedUsers);
  } catch (error) {
    next(error);
  }
};

const updateFollow = async (req, res, next) => {
  const { userId } = req.params;
  const { following } = req.body;

  if (typeof following !== 'boolean') {
    return res.status(400).json({ message: 'Following status must be a boolean.' });
  }
  if (!isValidObjectId(userId)) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const normalizedUserId = userId.toLowerCase();
  if (String(req.user._id) === normalizedUserId) {
    return res.status(400).json({ message: 'You cannot follow yourself.' });
  }

  let session;
  try {
    session = await User.startSession();
    await session.withTransaction(async () => {
      const target = await User.findById(normalizedUserId).session(session);
      if (!target) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      const ownUpdate = following
        ? { $addToSet: { following: normalizedUserId } }
        : { $pull: { following: normalizedUserId } };
      const targetUpdate = following
        ? { $addToSet: { followers: req.user._id } }
        : { $pull: { followers: req.user._id } };

      await User.updateOne({ _id: req.user._id }, ownUpdate, { session });
      await User.updateOne({ _id: normalizedUserId }, targetUpdate, { session });
    });

    res.json({ following });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const updateConnection = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { connected } = req.body;

    if (typeof connected !== 'boolean') {
      return res.status(400).json({ message: 'Connection status must be a boolean.' });
    }
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const normalizedUserId = userId.toLowerCase();
    if (String(req.user._id) === normalizedUserId) {
      return res.status(400).json({ message: 'You cannot connect with yourself.' });
    }

    const target = await User.findById(normalizedUserId);
    if (!target) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const update = connected
      ? { $addToSet: { connections: normalizedUserId } }
      : { $pull: { connections: normalizedUserId } };
    await User.updateOne({ _id: req.user._id }, update);

    res.json({ connected });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to change roles.' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ id: user._id, role: user.role });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete users.' });
    }

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await User.updateMany(
      { _id: { $ne: userId } },
      {
        $pull: {
          following: userId,
          followers: userId,
          connections: userId
        }
      }
    );
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully', id: userId });
  } catch (error) {
    next(error);
  }
};

const deleteMyAccount = async (req, res, next) => {
  let session;
  try {
    const { password } = req.body;
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Enter your password to confirm account deletion.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (!(await compare(password, user.password))) {
      return res.status(400).json({ message: 'The password you entered is incorrect.' });
    }

    const userId = user._id;
    const userIdString = String(userId);
    let posts = [];
    let resources = [];
    session = await User.startSession();
    await session.withTransaction(async () => {
      const [ownedPosts, ownedResources, rooms] = await Promise.all([
        Post.find({ author: userId }).session(session).select('imageName'),
        Resource.find({ uploadedBy: userId }).session(session).select('storageName'),
        Room.find({ createdBy: userId }).session(session).select('_id')
      ]);
      posts = ownedPosts;
      resources = ownedResources;
      const roomIds = rooms.map((room) => room._id);

      await Promise.all([
        User.updateMany(
          { _id: { $ne: userId } },
          { $pull: { following: userId, followers: userId, connections: userId } },
          { session }
        ),
        Post.updateMany(
          { author: { $ne: userId } },
          { $pull: { likes: userId, comments: { user: userId } } },
          { session }
        ),
        Post.deleteMany({ author: userId }, { session }),
        Resource.deleteMany({ uploadedBy: userId }, { session }),
        DirectMessage.deleteMany(
          { $or: [{ senderId: userId }, { receiverId: userId }] },
          { session }
        ),
        NotificationStatus.deleteMany({ user: userId }, { session }),
        Notice.deleteMany({ author: userId }, { session }),
        RoomMessage.deleteMany({
          $or: [
            { sender: userId },
            ...(roomIds.length > 0 ? [{ roomId: { $in: roomIds } }] : [])
          ]
        }, { session }),
        ...(roomIds.length > 0 ? [Room.deleteMany({ _id: { $in: roomIds } }, { session })] : [])
      ]);
      await User.findByIdAndDelete(userId, { session });
    });

    const fileCleanupTasks = [
      ...posts.map((post) => () => removeUploadedFile(
        POST_IMAGES_DIR,
        post.imageName,
        /^[a-f\d-]{36}\.(jpg|jpeg|png|webp)$/i
      )),
      ...resources.map((resource) => () => removeUploadedFile(
        UPLOADS_DIR,
        resource.storageName,
        /^[a-f\d-]{36}\.[a-z\d]+$/i
      ))
    ];

    if (typeof user.avatarUrl === 'string' && user.avatarUrl) {
      let avatarFilename;
      try {
        const avatarUrl = new URL(user.avatarUrl);
        avatarFilename = avatarUrl.pathname.startsWith('/api/users/avatars/')
          ? basename(avatarUrl.pathname)
          : '';
      } catch {
        avatarFilename = '';
      }
      fileCleanupTasks.push(() => removeUploadedFile(
        AVATARS_DIR,
        avatarFilename,
        /^[a-f\d-]{36}\.(jpg|jpeg|png|webp)$/i
      ));
    }

    const cleanupResults = await Promise.allSettled(fileCleanupTasks.map((cleanup) => cleanup()));
    const cleanupFailures = cleanupResults.filter((result) => result.status === 'rejected');
    if (cleanupFailures.length > 0) {
      cleanupFailures.forEach((failure) => console.error('Unable to remove account upload:', failure.reason));
    }

    res.json({
      message: cleanupFailures.length > 0
        ? 'Account and associated content were deleted, but some uploaded files could not be removed.'
        : 'Account and associated content were permanently deleted.',
      id: userIdString,
      uploadsCleanupRequired: cleanupFailures.length > 0
    });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

export default {
  getMe,
  getUsers,
  updateFollow,
  updateConnection,
  updateAvatarPreset,
  uploadAvatar,
  updateUserRole,
  deleteUser,
  deleteMyAccount
};