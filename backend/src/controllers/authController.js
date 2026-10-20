import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const registerUser = async (req, res, next) => {
  try {
    const { name, handle, email, password, department, bio, registrationNumber } = req.body;

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof handle !== 'string' || !handle.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password.trim()
    ) {
      return res.status(400).json({ message: 'Name, handle, email, and password are required.' });
    }
    if (registrationNumber !== undefined && typeof registrationNumber !== 'string') {
      return res.status(400).json({ message: 'Registration number must be text.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const normalizedHandle = handle.trim().toLowerCase();
    const existingHandle = await User.findOne({ handle: normalizedHandle });
    if (existingHandle) {
      return res.status(400).json({ message: 'Handle already exists.' });
    }

    const normalizedRegistrationNumber = registrationNumber?.trim().toLowerCase();
    if (normalizedRegistrationNumber) {
      const existingRegistrationNumber = await User.findOne({ registrationNumber: normalizedRegistrationNumber });
      if (existingRegistrationNumber) {
        return res.status(400).json({ message: 'Registration number already exists.' });
      }
    }

    const hashedPassword = await hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      handle: normalizedHandle,
      ...(normalizedRegistrationNumber ? { registrationNumber: normalizedRegistrationNumber } : {}),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
      department: typeof department === 'string' ? department.trim() : '',
      bio: typeof bio === 'string' ? bio.trim() : ''
    });

    res.status(201).json({
      message: 'User registered successfully',
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
    const { query, password, identifierType } = req.body;

    if (!query || !password) {
      return res.status(400).json({ message: 'Login ID and password are required.' });
    }

    const rawQuery = query.trim().toLowerCase();
    if (identifierType && !['registrationNumber', 'employeeId', 'email'].includes(identifierType)) {
      return res.status(400).json({ message: 'Invalid login ID type.' });
    }

    let loginQuery;
    if (identifierType === 'registrationNumber') {
      loginQuery = { registrationNumber: rawQuery, role: 'student' };
    } else if (identifierType === 'employeeId') {
      loginQuery = { employeeId: rawQuery, role: 'admin' };
    } else if (identifierType === 'email') {
      loginQuery = { email: rawQuery, role: 'student' };
    } else {
      const cleanQuery = rawQuery.replace(/^@/, '');
      loginQuery = { $or: [{ handle: cleanQuery }, { email: rawQuery }] };
    }

    const user = await User.findOne(loginQuery);

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