import express from 'express';

import {
  addComment,
  addAlbumMember,
  getAlbumInvitations,
  addReply,
  adminOverview,
  archivePost,
  batchUpdate,
  createAlbum,
  createManyPosts,
  createPost,
  checkDuplicates,
  dashboard,
  deleteAlbum,
  deleteComment,
  deleteDownload,
  deleteNotification,
  deletePost,
  downloadPost,
  favoritePost,
  getAlbums,
  getAlbum,
  getDownloads,
  getNotifications,
  getPost,
  getPosts,
  globalSearch,
  getSharedPost,
  getSharedAlbum,
  likePost,
  markNotificationRead,
  moderatePhoto,
  permanentDeletePost,
  restorePost,
  sharePost,
  shareToUsers,
  shareAlbum,
  shareAlbumToUsers,
  updateAlbum,
  updateAlbumMember,
  removeAlbumMember,
  respondToAlbumInvitation,
  revokePhotoShare,
  updateComment,
  updatePost,
  updateTransformations,
  createReport,
  getReports,
  updateReportStatus,
} from '../controllers/posts.js';
import { adminOnly, auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.get('/search', optionalAuth, globalSearch);
router.post('/', auth, createPost);
router.post('/bulk', auth, createManyPosts);
router.post('/check-duplicates', auth, checkDuplicates);
router.patch('/batch', auth, batchUpdate);
router.get('/dashboard', auth, dashboard);
router.get('/downloads', auth, getDownloads);
router.delete('/downloads/:id', auth, deleteDownload);
router.get('/notifications', auth, getNotifications);
router.patch('/notifications/:id/read', auth, markNotificationRead);
router.delete('/notifications/:id', auth, deleteNotification);
router.get('/albums', auth, getAlbums);
router.get('/albums/invitations', auth, getAlbumInvitations);
router.post('/albums', auth, createAlbum);
router.get('/albums/:id', optionalAuth, getAlbum);
router.patch('/albums/:id', auth, updateAlbum);
router.post('/albums/:id/members', auth, addAlbumMember);
router.patch('/albums/:id/members/:userId', auth, updateAlbumMember);
router.delete('/albums/:id/members/:userId', auth, removeAlbumMember);
router.patch('/albums/:id/invitation', auth, respondToAlbumInvitation);
router.delete('/albums/:id', auth, deleteAlbum);
router.post('/reports', auth, createReport);
router.get('/admin/reports', auth, adminOnly, getReports);
router.patch('/admin/reports/:id', auth, adminOnly, updateReportStatus);
router.get('/admin/overview', auth, adminOnly, adminOverview);
router.get('/shared/:token', getSharedPost);
router.get('/:id', optionalAuth, getPost);
router.patch('/:id', auth, updatePost);
router.patch('/:id/transformations', auth, updateTransformations);
router.delete('/:id', auth, deletePost);
router.delete('/:id/permanent', auth, permanentDeletePost);
router.patch('/:id/restore', auth, restorePost);
router.patch('/:id/likePost', auth, likePost);
router.patch('/:id/favorite', auth, favoritePost);
router.patch('/:id/archive', auth, archivePost);
router.post('/:id/share', auth, sharePost);
router.post('/albums/:id/share', auth, shareAlbum);
router.post('/:id/share-to', auth, shareToUsers);
router.delete('/:id/share', auth, revokePhotoShare);
router.post('/:id/download', auth, downloadPost);
router.post('/:id/comments', auth, addComment);
router.patch('/:id/comments/:commentId', auth, updateComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);
router.post('/:id/comments/:commentId/replies', auth, addReply);
router.patch('/:id/moderate', auth, adminOnly, moderatePhoto);
router.post('/albums/:id/share-to', auth, shareAlbumToUsers);
router.get('/shared/album/:token', getSharedAlbum);

router.post('/test-share', (req, res) => {
  console.log("TEST SHARE ROUTE WORKING");
  res.json({ ok: true });
});
export default router;
