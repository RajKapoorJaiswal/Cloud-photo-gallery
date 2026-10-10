const PROFILE_STORAGE_KEY = 'profile';
const STORAGE_FAILURE_MESSAGE = 'Your browser blocked storing the session. You can continue using the app, but you may need to sign in again after a refresh.';
const MAX_SESSION_SIZE = 4096;

const safeLocalStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const normalizeSession = (value) => {
  if (!value || typeof value !== 'object') return null;

  const token = typeof value.token === 'string' ? value.token : '';
  const userId = value.userId || value.result?._id || value.result?.id || '';
  const username = value.username || value.result?.username || '';
  const email = value.email || value.result?.email || '';
  const refreshToken = typeof value.refreshToken === 'string' ? value.refreshToken : '';

  if (!token || !userId || !email) return null;

  const session = {
    token,
    userId,
    username,
    email,
  };

  if (refreshToken) session.refreshToken = refreshToken;
  return session;
};

const isSessionWithinLimit = (session) => {
  if (!session) return false;
  try {
    return JSON.stringify(session).length <= MAX_SESSION_SIZE;
  } catch (error) {
    return false;
  }
};

export const clearStoredProfile = () => {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    // Ignore cleanup errors.
  }
};

export const readStoredProfile = () => {
  const storage = safeLocalStorage();
  if (!storage) return null;

  try {
    const rawValue = storage.getItem(PROFILE_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    const session = normalizeSession(parsed);

    if (!session) {
      clearStoredProfile();
      return null;
    }

    return session;
  } catch (error) {
    clearStoredProfile();
    return null;
  }
};

export const writeStoredProfile = (value, notify) => {
  const storage = safeLocalStorage();
  if (!storage) return false;

  try {
    const session = normalizeSession(value);
    if (!session || !isSessionWithinLimit(session)) {
      clearStoredProfile();
      return false;
    }

    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    clearStoredProfile();
    if (notify) notify(STORAGE_FAILURE_MESSAGE);
    return false;
  }
};

export const getStoredAuthToken = () => readStoredProfile()?.token || null;
