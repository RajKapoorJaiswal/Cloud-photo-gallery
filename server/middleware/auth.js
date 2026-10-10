import User from '../models/user.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) return res.status(401).json({ message: 'Authentication required.' });

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.deletedAt) return res.status(401).json({ message: 'Session expired.' });

    req.userId = decoded.id;
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired.' });
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && !user.deletedAt) {
        req.userId = decoded.id;
        req.user = user;
      }
    }
  } catch (error) {
    req.userId = null;
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  return next();
};
