import { AUTH, AUTH_ERROR, AUTH_LOADING, LOGOUT, PROFILE_UPDATED, STORAGE_UPDATED } from '../constants/actionTypes';
import { clearStoredProfile, readStoredProfile, writeStoredProfile } from '../utils/authStorage';

const storedProfile = readStoredProfile();

const authReducer = (state = { authData: storedProfile, loading: false, error: null, storage: null }, action) => {
  switch (action.type) {
    case AUTH:
      writeStoredProfile(action?.data);
      return { ...state, authData: action?.data, error: null };
    case AUTH_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ERROR:
      return { ...state, error: action.payload };
    case PROFILE_UPDATED: {
      const current = state.authData || {};
      const next = { ...current, result: action.payload };
      const compactSession = {
        token: current.token || '',
        refreshToken: current.refreshToken || '',
        userId: action.payload?._id || action.payload?.id || current.userId || '',
        username: action.payload?.username || current.username || '',
        email: action.payload?.email || current.email || '',
        avatar: action.payload?.avatar || current.avatar || '',
      };
      writeStoredProfile(compactSession);
      return { ...state, authData: next, error: null };
    }
    case STORAGE_UPDATED:
      return { ...state, storage: action.payload };
    case LOGOUT:
      clearStoredProfile();
      return { ...state, authData: null, storage: null };
    default:
      return state;
  }
};

export default authReducer;
