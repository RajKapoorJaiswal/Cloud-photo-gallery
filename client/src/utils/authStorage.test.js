import { clearStoredProfile, writeStoredProfile } from './authStorage';

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    clearStoredProfile();
  });

  it('rejects oversized auth session payloads before writing to storage', () => {
    const oversizedSession = {
      token: 'x'.repeat(6000),
      refreshToken: 'y'.repeat(6000),
      userId: 'user-1',
      username: 'test-user',
      email: 'test@example.com',
      avatar: 'avatar-url',
    };

    const didWrite = writeStoredProfile(oversizedSession);

    expect(didWrite).toBe(false);
    expect(localStorage.getItem('profile')).toBeNull();
  });
});
