import { createHash, randomBytes } from 'node:crypto';

export const createEmailVerificationToken = () => {
  const token = randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: createHash('sha256').update(token).digest('hex'),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
};

export const hashEmailVerificationToken = (token) =>
  createHash('sha256').update(token).digest('hex');

export const getEmailVerificationUrl = (token) => {
  const url = new URL(process.env.CLIENT_URL);
  url.hash = new URLSearchParams({ verifyEmail: token }).toString();
  return url.toString();
};
