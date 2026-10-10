import axios from 'axios';
import { getStoredAuthToken, readStoredProfile, writeStoredProfile } from '../utils/authStorage';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

API.interceptors.request.use((req) => {
  const token = getStoredAuthToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const profile = readStoredProfile();

    if (error.response?.status === 401 && profile?.refreshToken && !original?.retryCount && !original?.url?.includes('/user/refresh')) {
      original.retryCount = 1;
      const { data } = await API.post('/user/refresh', { refreshToken: profile.refreshToken });
      const compactData = {
        token: data.token,
        refreshToken: data.refreshToken,
        userId: data.result?._id || data.result?.id,
        username: data.result?.username || '',
        email: data.result?.email || '',
        avatar: data.result?.avatar || '',
      };
      writeStoredProfile(compactData);
      original.headers.Authorization = `Bearer ${data.token}`;
      return API(original);
    }

    throw error;
  },
);

export const fetchPosts = (params) => API.get('/posts', { params });
export const fetchPost = (id) => API.get(`/posts/${id}`);
export const createPost = (newPost, onUploadProgress) => API.post('/posts', newPost, { onUploadProgress });
export const createManyPosts = (photos, onUploadProgress) => API.post('/posts/bulk', { photos }, { onUploadProgress });
export const checkDuplicates = (photos) => API.post('/posts/check-duplicates', { photos });
export const updatePost = (id, updatedPost) => API.patch(`/posts/${id}`, updatedPost);
export const likePost = (id) => API.patch(`/posts/${id}/likePost`);
export const favoritePost = (id) => API.patch(`/posts/${id}/favorite`);
export const archivePost = (id, isArchived) => API.patch(`/posts/${id}/archive`, { isArchived });
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const restorePost = (id) => API.patch(`/posts/${id}/restore`);
export const permanentDeletePost = (id) => API.delete(`/posts/${id}/permanent`);
export const sharePost = (id, payload) => API.post(`/posts/${id}/share`, payload);
export const sharePostToUsers = (id, userIds, options = {}) => API.post(`/posts/${id}/share-to`, { userIds, ...options });
export const revokePhotoShare = (id, userId) => API.delete(`/posts/${id}/share`, { data: userId ? { userId } : {} });
export const downloadPost = (id) => API.post(`/posts/${id}/download`);
export const updateTransformations = (id, payload) => API.patch(`/posts/${id}/transformations`, payload);
export const batchUpdate = (payload) => API.patch('/posts/batch', payload);
export const addComment = (id, payload) => API.post(`/posts/${id}/comments`, payload);
export const updateComment = (id, commentId, payload) => API.patch(`/posts/${id}/comments/${commentId}`, payload);
export const deleteComment = (id, commentId) => API.delete(`/posts/${id}/comments/${commentId}`);
export const addReply = (id, commentId, payload) => API.post(`/posts/${id}/comments/${commentId}/replies`, payload);
export const fetchDashboard = () => API.get('/posts/dashboard');
export const fetchAlbums = () => API.get('/posts/albums');
export const fetchAlbum = (id) => API.get(`/posts/albums/${id}`);
export const createAlbum = (payload) => API.post('/posts/albums', payload);
export const updateAlbum = (id, payload) => API.patch(`/posts/albums/${id}`, payload);
export const deleteAlbum = (id) => API.delete(`/posts/albums/${id}`);
export const addAlbumMember = (id, payload) => API.post(`/posts/albums/${id}/members`, payload);
export const updateAlbumMember = (id, userId, payload) => API.patch(`/posts/albums/${id}/members/${userId}`, payload);
export const removeAlbumMember = (id, userId) => API.delete(`/posts/albums/${id}/members/${userId}`);
export const shareAlbumToUsers = (id, userIds) => API.post(`/posts/albums/${id}/share-to`, { userIds });
export const fetchAlbumInvitations = () => API.get('/posts/albums/invitations');
export const respondToAlbumInvitation = (id, response) => API.patch(`/posts/albums/${id}/invitation`, { response });
export const adminOverview = () => API.get('/posts/admin/overview');
export const fetchDownloads = () => API.get('/posts/downloads');
export const deleteDownloadHistory = (id) => API.delete(`/posts/downloads/${id}`);
export const fetchNotifications = () => API.get('/posts/notifications');
export const markNotificationRead = (id) => API.patch(`/posts/notifications/${id}/read`);
export const deleteNotification = (id) => API.delete(`/posts/notifications/${id}`);

// Authentication
export const signIn = (formData) => API.post('/user/signin', formData);
export const signUp = (formData) => API.post('/user/signup', formData);
export const logout = (refreshToken) => API.post('/user/logout', { refreshToken });
export const logoutAll = () => API.post('/user/logout-all');
export const me = () => API.get('/user/me');
export const updateProfile = (payload) => API.patch('/user/profile', payload);
export const storageUsage = () => API.get('/user/storage');
export const exportBackup = () => API.get('/user/backup');
export const restoreBackup = (backup) => API.post('/user/restore', { backup });
export const verifyEmail = (token) => API.post('/user/verify-email', { token });
export const sendOtp = (email) => API.post('/user/otp/send', { email });
export const verifyOtp = (payload) => API.post('/user/otp/verify', payload);
export const forgotPassword = (email) => API.post('/user/forgot-password', { email });
export const resetPassword = (payload) => API.post('/user/reset-password', payload);
export const changePassword = (payload) => API.patch('/user/change-password', payload);
export const deleteAccount = () => API.delete('/user/account');
export const searchUsers = (q) => API.get('/user/search', { params: { q } });
export const publicProfile = (id) => API.get(`/user/profile/${id}`);
export const socialConnections = (id) => API.get(`/user/profile/${id}/connections`);
export const followUser = (id) => API.patch(`/user/follow/${id}`);
export const unfollowUser = (id) => API.patch(`/user/unfollow/${id}`);
export const searchGlobal = (q) => API.get('/posts/search', { params: { q } });
export const fetchConversations = () => API.get('/messages');
export const createConversation = (participantIds) => API.post('/messages', { participantIds });
export const fetchMessages = (id) => API.get(`/messages/${id}/messages`);
export const sendMessage = (id, payload) => API.post(`/messages/${id}/messages`, payload);
export const deleteMessage = (id, messageId) => API.delete(`/messages/${id}/messages/${messageId}`);
export const reactToMessage = (id, messageId, emoji) => API.patch(`/messages/${id}/messages/${messageId}/reactions`, { emoji });
export const blockUser = (id) => API.post(`/user/block/${id}`);
export const unblockUser = (id) => API.delete(`/user/block/${id}`);
export const fetchAuditLog = () => API.get('/user/audit-log');
export const updatePrivacySettings = (payload) => API.patch('/user/privacy', payload);
export const submitReport = (payload) => API.post('/posts/reports', payload);
export const fetchAdminReports = () => API.get('/posts/admin/reports');
export const updateReportStatus = (id, status) => API.patch(`/posts/admin/reports/${id}`, { status });
