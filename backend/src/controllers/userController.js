import { unlink } from 'fs/promises';
import User from '../models/User.js';

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
      connected: false,
      following: false
    }));
    
    res.json(normalizedUsers);
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

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully', id: userId });
  } catch (error) {
    next(error);
  }
};

export default {
  getMe,
  getUsers,
  updateAvatarPreset,
  uploadAvatar,
  updateUserRole,
  deleteUser
};