import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import emailService from '../services/emailService.js';
import { createEmailVerificationToken, getEmailVerificationUrl, hashEmailVerificationToken } from '../utils/emailVerification.js';

const VERIFICATION_RESEND_DELAY_MS = 60 * 1000;

const sendVerification = async (user, verification) => {
  user.emailVerificationTokenHash = verification.tokenHash;
  user.emailVerificationExpires = verification.expiresAt;
  await user.save();

  try {
    await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl: getEmailVerificationUrl(verification.token)
    });
  } catch (error) {
    console.error('Unable to send email verification:', error);
    return false;
  }

  user.emailVerificationSentAt = new Date();
  await user.save();
  return true;
};

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
    if (!emailService.isEmailDeliveryConfigured()) {
      return res.status(503).json({ message: 'Email verification is temporarily unavailable. Please try again later.' });
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

    const verification = createEmailVerificationToken();
    const user = await User.create({
      name: name.trim(),
      handle: normalizedHandle,
      ...(normalizedRegistrationNumber ? { registrationNumber: normalizedRegistrationNumber } : {}),
      email: normalizedEmail,
      emailVerified: false,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpires: verification.expiresAt,
      password: hashedPassword,
      role: 'student',
      department: typeof department === 'string' ? department.trim() : '',
      bio: typeof bio === 'string' ? bio.trim() : ''
    });

    const verificationEmailSent = await sendVerification(user, verification);

    res.status(201).json({
      message: verificationEmailSent
        ? 'Account created. Check your email for a verification link before signing in.'
        : 'Account created, but the verification email could not be sent. Use resend verification to try again.',
      verificationEmailSent,
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

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (typeof token !== 'string' || !/^[a-f\d]{64}$/i.test(token)) {
      return res.status(400).json({ message: 'This verification link is invalid or expired.' });
    }

    const user = await User.findOneAndUpdate(
      {
        emailVerificationTokenHash: hashEmailVerificationToken(token),
        emailVerificationExpires: { $gt: new Date() },
        emailVerified: false
      },
      {
        $set: { emailVerified: true },
        $unset: {
          emailVerificationTokenHash: 1,
          emailVerificationExpires: 1,
          emailVerificationSentAt: 1
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or expired.' });
    }

    res.json({ message: 'Email verified. You can now sign in.' });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!emailService.isEmailDeliveryConfigured()) {
      return res.status(503).json({ message: 'Email verification is temporarily unavailable. Please try again later.' });
    }

    const user = await User.findOne({ email, role: 'student' });
    if (user && user.emailVerified === false) {
      const sentAt = user.emailVerificationSentAt?.getTime?.() || 0;
      if (Date.now() - sentAt >= VERIFICATION_RESEND_DELAY_MS) {
        const verification = createEmailVerificationToken();
        const sent = await sendVerification(user, verification);
        if (!sent) {
          return res.status(503).json({ message: 'We could not send the verification email. Please try again later.' });
        }
      }
    }

    res.json({
      message: 'If an unverified account exists for that address, a verification email has been sent. If you recently requested one, wait a minute before trying again.'
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

    if (user.role === 'student' && user.emailVerified === false) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verify your email before signing in.',
        email: user.email
      });
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

export default { registerUser, verifyEmail, resendVerification, loginUser };