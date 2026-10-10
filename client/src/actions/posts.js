import {
  CREATE,
  DELETE,
  FETCH_ALL,
  LIKE,
  SET_ALBUMS,
  SET_DASHBOARD,
  SET_FILTERS,
  SET_POSTS_ERROR,
  SET_POSTS_LOADING,
  UPDATE,
} from '../constants/actionTypes';

import * as api from '../api/index.js';

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong.';

export const getPosts = (params = {}) => async (dispatch, getState) => {
  const postsState = getState().posts || {};
  const filters = postsState.filters || {};
  const normalizedParams = { ...filters, ...params };
  const requestKey = JSON.stringify(normalizedParams);

  if (postsState.loading && postsState.requestKey === requestKey) {
    return null;
  }

  try {
    dispatch({ type: SET_POSTS_LOADING, payload: true });
    const { data } = await api.fetchPosts(normalizedParams);
    dispatch({ type: FETCH_ALL, payload: data, meta: { requestKey } });
    return data;
  } catch (error) {
    dispatch({ type: SET_POSTS_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: SET_POSTS_LOADING, payload: false });
  }
};

export const setFilters = (filters) => ({ type: SET_FILTERS, payload: filters });

export const createPost = (post, onUploadProgress) => async (dispatch) => {
  try {
    const { data } = await api.createPost(post, onUploadProgress);
    dispatch({ type: CREATE, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: SET_POSTS_ERROR, payload: getError(error) });
    throw error;
  }
};

export const createManyPosts = (photos, onUploadProgress) => async (dispatch) => {
  const { data } = await api.createManyPosts(photos, onUploadProgress);
  data.forEach((photo) => dispatch({ type: CREATE, payload: photo }));
  return data;
};

export const updatePost = (id, post) => async (dispatch) => {
  const { data } = await api.updatePost(id, post);
  dispatch({ type: UPDATE, payload: data });
  return data;
};

export const likePost = (id) => async (dispatch) => {
  const { data } = await api.likePost(id);
  dispatch({ type: LIKE, payload: data });
};

export const favoritePost = (id) => async (dispatch) => {
  const { data } = await api.favoritePost(id);
  dispatch({ type: UPDATE, payload: data });
};

export const archivePost = (id, isArchived) => async (dispatch) => {
  const { data } = await api.archivePost(id, isArchived);
  dispatch({ type: UPDATE, payload: data });
};

export const deletePost = (id) => async (dispatch) => {
  await api.deletePost(id);
  dispatch({ type: DELETE, payload: id });
};

export const restorePost = (id) => async (dispatch) => {
  const { data } = await api.restorePost(id);
  dispatch({ type: UPDATE, payload: data });
};

export const permanentDeletePost = (id) => async (dispatch) => {
  await api.permanentDeletePost(id);
  dispatch({ type: DELETE, payload: id });
  try {
    const { data } = await api.storageUsage();
    dispatch({ type: 'STORAGE_UPDATED', payload: data });
  } catch (err) {}
};

export const sharePost = (id, payload) => async () => {
  const { data } = await api.sharePost(id, payload);
  return data;
};

export const revokePhotoShare = (id, userId) => async (dispatch) => {
  const { data } = await api.revokePhotoShare(id, userId);
  dispatch({ type: DELETE, payload: id });
  return data;
};

export const downloadPost = (id) => async (dispatch) => {
  const { data } = await api.downloadPost(id);
  dispatch({ type: UPDATE, payload: data.post });
  return data;
};

export const updateTransformations = (id, payload) => async (dispatch) => {
  const { data } = await api.updateTransformations(id, payload);
  dispatch({ type: UPDATE, payload: data });
};

export const addComment = (id, payload) => async (dispatch) => {
  const { data } = await api.addComment(id, payload);
  dispatch({ type: UPDATE, payload: data });
};

export const updateComment = (id, commentId, payload) => async (dispatch) => {
  const { data } = await api.updateComment(id, commentId, payload);
  dispatch({ type: UPDATE, payload: data });
};

export const deleteComment = (id, commentId) => async (dispatch) => {
  const { data } = await api.deleteComment(id, commentId);
  dispatch({ type: UPDATE, payload: data });
};

export const batchUpdate = (payload) => async (dispatch) => {
  const { data } = await api.batchUpdate(payload);
  data.forEach((photo) => dispatch({ type: UPDATE, payload: photo }));
  return data;
};

export const loadDashboard = () => async (dispatch) => {
  const { data } = await api.fetchDashboard();
  dispatch({ type: SET_DASHBOARD, payload: data });
};

export const loadAlbums = () => async (dispatch) => {
  const { data } = await api.fetchAlbums();
  dispatch({ type: SET_ALBUMS, payload: data });
};

export const createAlbum = (payload) => async (dispatch) => {
  const { data } = await api.createAlbum(payload);
  dispatch(loadAlbums());
  return data;
};

export const loadAdminOverview = () => async () => {
  const { data } = await api.adminOverview();
  return data;
};
