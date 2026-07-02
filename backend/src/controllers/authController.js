import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const registerUser = async (req, res, next) => {
  try {
    const { name, handle, email, password, department, bio } = req.body;

    if (!name || !handle || !email || !password) {
      return res.status(400).json({ message: 'Name, handle, email, and password are required.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const existingHandle = await User.findOne({ handle: handle.toLowerCase() });
    if (existingHandle) {
      return res.status(400).json({ message: 'Handle already exists.' });
    }

    const hashedPassword = await hash(password, 10);

    const user = await User.create({
      name,
      handle: handle.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      department: department || '',
      bio: bio || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        role: user.role,
        department: user.department,
        bio: user.bio,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { query, password } = req.body;

    if (!query || !password) {
      return res.status(400).json({ message: 'Handle/email and password are required.' });
    }

    const rawQuery = query.trim().toLowerCase();
    const cleanQuery = rawQuery.replace(/^@/, '');

    const user = await User.findOne({
      $or: [
        { handle: cleanQuery },
        { email: rawQuery }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        role: user.role,
        department: user.department,
        bio: user.bio,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { registerUser, loginUser };