import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const accessSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return process.env.JWT_SECRET;
};

const refreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured.');
  }
  return process.env.JWT_REFRESH_SECRET;
};


export const createRandomToken = () => crypto.randomBytes(32).toString('hex');

export const createAccessToken = (user) => jwt.sign(
  { email: user.email, id: user._id, role: user.role },
  accessSecret(),
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
);

export const createRefreshToken = (user, rememberMe = false) => jwt.sign(
  { id: user._id, rememberMe },
  refreshSecret(),
  { expiresIn: rememberMe ? '30d' : '7d' },
);

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret());
export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret());
