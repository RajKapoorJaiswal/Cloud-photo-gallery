import * as api from '../api';
import { AUTH, AUTH_ERROR, AUTH_LOADING, LOGOUT, PROFILE_UPDATED, STORAGE_UPDATED } from '../constants/actionTypes';
import { clearStoredProfile, readStoredProfile, writeStoredProfile } from '../utils/authStorage';

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong.';

export const signin = (formData) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING, payload: true });
    const { data } = await api.signIn(formData);
    const compactData = {
      token: data.token,
      refreshToken: data.refreshToken,
      result: data.result,
      userId: data.result?._id || data.result?.id,
      username: data.result?.username || '',
      email: data.result?.email || '',
    };
    dispatch({ type: AUTH, data: compactData });
    writeStoredProfile(compactData);
    return data;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: AUTH_LOADING, payload: false });
  }
};

export const signup = (formData) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING, payload: true });
    const { data } = await api.signUp(formData);
    const compactData = {
      token: data.token,
      refreshToken: data.refreshToken,
      result: data.result,
      userId: data.result?._id || data.result?.id,
      username: data.result?.username || '',
      email: data.result?.email || '',
    };
    dispatch({ type: AUTH, data: compactData });
    writeStoredProfile(compactData);
    return data;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: AUTH_LOADING, payload: false });
  }
};

export const autoLogin = () => async (dispatch) => {
  const stored = readStoredProfile();
  if (!stored?.token) return null;
  dispatch({ type: AUTH, data: stored });
  try {
    const { data } = await api.me();
    dispatch({ type: PROFILE_UPDATED, payload: data.result });
    return data.result;
  } catch (error) {
    dispatch({ type: LOGOUT });
    return null;
  }
};

export const logoutUser = () => async (dispatch) => {
  const stored = readStoredProfile();
  try {
    if (stored?.refreshToken) await api.logout(stored.refreshToken);
  } finally {
    dispatch({ type: LOGOUT });
  }
};

export const logoutAllDevices = () => async (dispatch) => {
  try {
    await api.logoutAll();
  } finally {
    dispatch({ type: LOGOUT });
  }
};

export const saveProfile = (payload) => async (dispatch) => {
  const { data } = await api.updateProfile(payload);
  dispatch({ type: PROFILE_UPDATED, payload: data.result });
  return data.result;
};

export const loadStorage = () => async (dispatch) => {
  const { data } = await api.storageUsage();
  dispatch({ type: STORAGE_UPDATED, payload: data });
  return data;
};

export const requestPasswordReset = (email) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING, payload: true });
    const { data } = await api.forgotPassword(email);
    return data;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: AUTH_LOADING, payload: false });
  }
};

export const resetPassword = (payload) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING, payload: true });
    const { data } = await api.resetPassword(payload);
    return data;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: AUTH_LOADING, payload: false });
  }
};

export const verifyEmail = (token) => async (dispatch) => {
  const { data } = await api.verifyEmail(token);
  dispatch({ type: PROFILE_UPDATED, payload: data.result });
  return data;
};

export const sendOtp = (email) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING, payload: true });
    const { data } = await api.sendOtp(email);
    return data;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: AUTH_LOADING, payload: false });
  }
};

export const verifyOtp = (payload) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING, payload: true });
    const { data } = await api.verifyOtp(payload);
    return data;
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: getError(error) });
    throw error;
  } finally {
    dispatch({ type: AUTH_LOADING, payload: false });
  }
};

export const changePassword = (payload) => async (dispatch) => {
  const { data } = await api.changePassword(payload);
  dispatch({ type: LOGOUT });
  clearStoredProfile();
  return data;
};

export const deleteAccount = () => async (dispatch) => {
  const { data } = await api.deleteAccount();
  dispatch({ type: LOGOUT });
  clearStoredProfile();
  return data;
};
