import express from 'express';

import {
  changePassword,
  acceptFriendRequest,
  deleteAccount,
  followUser,
  forgotPassword,
  getFriendRequests,
  logout,
  logoutAll,
  me,
  oauthCallback,
  oauthStart,
  refreshSession,
  resetPassword,
  publicProfile,
  searchUsers,
  socialConnections,
  sendFriendRequest,
  sendOtp,
  signin,
  signup,
  storageUsage,
  updateProfile,
  unfollowUser,
  rejectFriendRequest,
  verifyEmail,
  verifyOtp,
  blockUser,
  unblockUser,
  getAuditLog,
  updatePrivacySettings,
  exportBackup,
  restoreBackup,
} from '../controllers/users.js';
import { auth } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.get('/oauth/:provider', oauthStart);
router.get('/oauth/:provider/callback', oauthCallback);
router.post('/refresh', refreshSession);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);
router.get('/me', auth, me);
router.get('/search', optionalAuth, searchUsers);
router.get('/profile/:id', optionalAuth, publicProfile);
router.get('/profile/:id/connections', optionalAuth, socialConnections);
router.patch('/follow/:id', auth, followUser);
router.patch('/unfollow/:id', auth, unfollowUser);
router.post('/friend-request/:id', auth, sendFriendRequest);
router.get('/friend-requests', auth, getFriendRequests);
router.patch('/friend-requests/:requestId/accept', auth, acceptFriendRequest);
router.patch('/friend-requests/:requestId/reject', auth, rejectFriendRequest);
router.patch('/profile', auth, updateProfile);
router.get('/storage', auth, storageUsage);
router.get('/backup', auth, exportBackup);
router.post('/restore', auth, restoreBackup);
router.post('/verify-email', verifyEmail);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount);
router.post('/block/:id', auth, blockUser);
router.delete('/block/:id', auth, unblockUser);
router.get('/audit-log', auth, getAuditLog);
router.patch('/privacy', auth, updatePrivacySettings);

export default router;
