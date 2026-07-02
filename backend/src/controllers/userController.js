import User from '../models/User';

const getMe = async (req, res) => {
  res.json(req.user);
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

export default { getMe, getUsers, updateUserRole, deleteUser };