import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import User from '../models/user.js';
import PostMessage from '../models/postMessage.js';
import Album from '../models/album.js';
import Notification from '../models/notification.js';
import AuditLog from '../models/auditLog.js';
import { createAccessToken, createRefreshToken, createRandomToken, verifyRefreshToken } from '../utils/tokens.js';
import { sendOtpEmail } from '../utils/email.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildAuthPayload = async (user, rememberMe = false) => {
  const refreshToken = createRefreshToken(user, rememberMe);
  const refreshExpiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);

  user.refreshTokens = [
    ...(user.refreshTokens || []).filter((item) => item.expiresAt > new Date()).slice(-4),
    { token: refreshToken, expiresAt: refreshExpiresAt },
  ];
  user.settings.rememberMe = rememberMe;
  user.lastLoginAt = new Date();
await User.findByIdAndUpdate(
  user._id,
  {
    $set: {
      refreshTokens: user.refreshTokens,
      lastLoginAt: new Date(),
      "settings.rememberMe": rememberMe,
    },
  },
  { new: true }
);

  return {
    result: user.toSafeObject(),
    token: createAccessToken(user),
    refreshToken,
    expiresIn: 15 * 60,
  };
};

const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Password must include letters and numbers.';
  return null;
};

const safeClientUrl = (value) => {
  const fallback = process.env.CLIENT_URL || 'http://localhost:3000';
  if (!value) return fallback;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return fallback;
    return url.origin;
  } catch (error) {
    return fallback;
  }
};

const clientUrl = (req) => safeClientUrl(req?.query?.client || req?.get?.('origin') || req?.get?.('referer'));

const providerConfig = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    mapUser: (profile) => ({
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      account: { id: profile.sub, email: profile.email, connectedAt: new Date() },
    }),
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
    emailUrl: 'https://api.github.com/user/emails',
    scope: 'read:user user:email',
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    mapUser: (profile, emails = []) => {
      const primary = emails.find((item) => item.primary) || emails[0] || {};
      return {
        email: primary.email || profile.email,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        account: { id: String(profile.id), username: profile.login, connectedAt: new Date() },
      };
    },
  },
};

const callbackUrl = (req, provider) => `${req.protocol}://${req.get('host')}/user/oauth/${provider}/callback`;

const encodeState = (state) => Buffer.from(JSON.stringify(state)).toString('base64url');

const decodeState = (value) => {
  try {
    return JSON.parse(Buffer.from(value || '', 'base64url').toString('utf8'));
  } catch (error) {
    return {};
  }
};

const redirectWithAuth = (res, payload, targetClient) => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return res.redirect(`${safeClientUrl(targetClient)}/auth/oauth?session=${encoded}`);
};

export const signin = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  if (!emailPattern.test(email || '') || !password) {
    return res.status(400).json({ message: 'Valid email and password are required.' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+password');


  if (!existingUser) {
  return res.status(401).json({ message: 'Invalid credentials.' });
}

  const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials.' });

  existingUser.loginHistory = [
    ...(existingUser.loginHistory || []).slice(-19),
    { ip: req.ip, userAgent: req.get('user-agent') },
  ];

  return res.status(200).json(await buildAuthPayload(existingUser, rememberMe));
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName = '', lastName = '', rememberMe = false, avatar = '', username = '', phone = '' } = req.body;

  if (!emailPattern.test(email || '')) return res.status(400).json({ message: 'A valid email address is required.' });
  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match." });

  const existingUser = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  if (existingUser) return res.status(400).json({ message: 'User already exists.' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = createRandomToken();

  const result = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
    avatar,
    username,
    phone,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  const authPayload = await buildAuthPayload(result, rememberMe);

return res.status(201).json({
  ...authPayload,
  ...(process.env.NODE_ENV !== 'production' ? { verificationToken } : {}),
  message: 'Account created. Please verify your email address.',
});
};

export const refreshSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({
        message: 'Refresh token is required.',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    const stored = user?.refreshTokens?.find(
      (item) =>
        item.token === refreshToken &&
        item.expiresAt > new Date()
    );

    if (!user || !stored || user.deletedAt) {
      return res.status(401).json({
        message: 'Refresh session expired.',
      });
    }

    return res.status(200).json(
      await buildAuthPayload(user, decoded.rememberMe)
    );
  } catch (error) {
    return res.status(401).json({
      message: 'Refresh session expired.',
    });
  }
};


export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (req.user && refreshToken) {
    req.user.refreshTokens = (req.user.refreshTokens || []).filter((item) => item.token !== refreshToken);
    await req.user.save();
  }
  return res.json({ message: 'Logged out successfully.' });
};

export const logoutAll = async (req, res) => {
  req.user.refreshTokens = [];
  await req.user.save();
  return res.json({ message: 'Logged out from all devices.' });
};

export const me = async (req, res) => res.json({ result: req.user.toSafeObject() });

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired verification token.' });

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return res.json({ result: user.toSafeObject(), message: 'Email verified.' });
};

export const oauthStart = async (req, res) => {
  const { provider } = req.params;
  const config = providerConfig[provider];
  if (!config) return res.status(404).json({ message: 'OAuth provider not supported.' });
  const targetClient = clientUrl(req);
  if (!config.clientId() || !config.clientSecret()) {
    return res.redirect(`${targetClient}/auth/oauth-config?provider=${encodeURIComponent(provider)}`);
  }

  const state = encodeState({ nonce: crypto.randomBytes(16).toString('hex'), client: targetClient });
  const url = new URL(config.authUrl);
  url.searchParams.set('client_id', config.clientId());
  url.searchParams.set('redirect_uri', callbackUrl(req, provider));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  return res.redirect(url.toString());
};

export const oauthCallback = async (req, res) => {
  const { provider } = req.params;
  const { code, state } = req.query;
  const stateData = decodeState(state);
  const targetClient = safeClientUrl(stateData.client);
  const config = providerConfig[provider];
  if (!config || !code) return res.redirect(`${targetClient}/auth/login`);

  if (!config.clientId() || !config.clientSecret()) {
    return res.redirect(`${targetClient}/auth/oauth-config?provider=${encodeURIComponent(provider)}`);
  }

  const tokenBody = new URLSearchParams({
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    code,
    redirect_uri: callbackUrl(req, provider),
    grant_type: 'authorization_code',
  });

  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: tokenBody,
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) return res.redirect(`${targetClient}/auth/login?oauth=failed`);

  const profileResponse = await fetch(config.userUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
  });
  const profile = await profileResponse.json();
  let emails = [];

  if (provider === 'github' && config.emailUrl) {
    const emailResponse = await fetch(config.emailUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
    });
    emails = await emailResponse.json();
  }

  const mapped = config.mapUser(profile, emails);
  if (!mapped.email) return res.redirect(`${targetClient}/auth/login?oauth=no-email`);

  let user = await User.findOne({ email: mapped.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      email: mapped.email.toLowerCase(),
      name: mapped.name || mapped.email.split('@')[0],
      avatar: mapped.avatar,
      password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
      emailVerified: true,
    });
  }

  user.avatar = user.avatar || mapped.avatar;
  user.connectedAccounts = {
    ...(user.connectedAccounts || {}),
    [provider]: mapped.account,
  };
  await user.save();

  return redirectWithAuth(res, await buildAuthPayload(user, true), targetClient);
};

export const sendOtp = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const user = await User.findOne({ email, deletedAt: null });
  const genericResponse = {
    message: 'If an account with that email address exists, a 6-digit OTP verification code has been sent to your email.',
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  // Rate limiting: 60 seconds request cooldown
  if (user.otpLastRequestedAt && Date.now() - new Date(user.otpLastRequestedAt).getTime() < 60000) {
    const remainingSec = Math.ceil((60000 - (Date.now() - new Date(user.otpLastRequestedAt).getTime())) / 1000);
    return res.status(429).json({ message: `Please wait ${remainingSec} seconds before requesting another OTP.` });
  }

  // Generate cryptographically secure 6-digit OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otpHash = otpHash;
  user.otpCode = undefined;
  user.otpExpires = otpExpires;
  user.otpAttempts = 0;
  user.otpLastRequestedAt = new Date();
  await user.save();

  try {
    await sendOtpEmail({ to: user.email, name: user.name, otp: rawOtp });
    return res.status(200).json({
      message: 'OTP sent to your registered email.',
    });
  } catch (err) {
    console.error(`[OTP Error] Failed to deliver OTP email to ${email}:`, err.message);

    // Revert OTP request state on DB so user is not locked into 60s cooldown due to failed email send
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpLastRequestedAt = undefined;
    await user.save().catch(() => {});

    return res.status(500).json({
      message: 'Unable to send OTP. Please check email configuration and try again.',
    });
  }
};

export const forgotPassword = sendOtp;

export const verifyOtp = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || req.body.token || '').trim();

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Please enter a valid 6-digit numeric OTP code.' });
  }

  const user = await User.findOne({ email, deletedAt: null });
  if (!user || !user.otpHash) {
    return res.status(400).json({ message: 'Invalid or expired OTP verification code.' });
  }

  // Check expiration
  if (new Date() > new Date(user.otpExpires)) {
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();
    return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
  }

  // Check max attempts
  if ((user.otpAttempts || 0) >= 5) {
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();
    return res.status(429).json({ message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.' });
  }

  // Verify SHA-256 OTP Hash
  const incomingHash = crypto.createHash('sha256').update(otp).digest('hex');
  if (incomingHash !== user.otpHash) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await user.save();
    const remaining = Math.max(0, 5 - user.otpAttempts);
    return res.status(400).json({ message: `Incorrect OTP code. ${remaining} attempt(s) remaining.` });
  }

  // OTP verified: Invalidate OTP (single use) and create temporary single-use Reset Session Token
  const resetSessionToken = crypto.randomBytes(32).toString('hex');
  const resetSessionExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  user.otpHash = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.resetSessionToken = resetSessionToken;
  user.resetSessionExpires = resetSessionExpires;
  await user.save();

  return res.json({
    message: 'OTP verified successfully. You can now set a new password.',
    resetSessionToken,
    resetToken: resetSessionToken,
  });
};

export const resetPassword = async (req, res) => {
  const { token, resetSessionToken, resetToken, password, confirmPassword } = req.body;
  const activeToken = resetSessionToken || resetToken || token;

  if (!activeToken) {
    return res.status(400).json({ message: 'A valid reset verification session is required.' });
  }

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match." });

  const user = await User.findOne({
    $or: [
      { resetSessionToken: activeToken, resetSessionExpires: { $gt: new Date() } },
      { resetPasswordToken: activeToken, resetPasswordExpires: { $gt: new Date() } },
    ],
    deletedAt: null,
  }).select('+password');

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset session. Please request a new OTP code.' });
  }

  // Save new hashed password & clear reset tokens & sign out all active sessions
  user.password = await bcrypt.hash(password, 12);
  user.resetSessionToken = undefined;
  user.resetSessionExpires = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  await Notification.create({
    user: user._id,
    actor: user._id,
    type: 'password',
    title: 'Password Reset Successful',
    message: 'Your password was successfully reset and all active sessions were signed out.',
  }).catch(() => {});

  return res.json({ message: 'Password reset successfully. Please sign in with your new password.' });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.userId).select('+password');

  const matches = await bcrypt.compare(currentPassword || '', user.password);
  if (!matches) return res.status(400).json({ message: 'Current password is incorrect.' });

  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ message: passwordError });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords don't match." });

  user.password = await bcrypt.hash(newPassword, 12);
  user.refreshTokens = [];
  await user.save();
  await Notification.create({ user: req.userId, actor: req.userId, type: 'password', title: 'Password changed', message: 'Your password was changed and all sessions were signed out.' });

  return res.json({ message: 'Password changed. Please sign in again.' });
};

export const updateProfile = async (req, res) => {
  if (req.body.email !== undefined && req.body.email !== req.user.email) {
    if (!emailPattern.test(req.body.email || '')) return res.status(400).json({ message: 'A valid email address is required.' });
    const existingEmail = await User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.userId }, deletedAt: null });
    if (existingEmail) return res.status(400).json({ message: 'Email is already in use.' });
    req.user.email = req.body.email.toLowerCase();
    req.user.emailVerified = false;
    req.user.emailVerificationToken = createRandomToken();
    req.user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  if (req.body.username !== undefined && req.body.username !== req.user.username) {
    const username = String(req.body.username || '').trim();
    if (username && !/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) return res.status(400).json({ message: 'Username must be 3-30 characters and use letters, numbers, dot, dash or underscore.' });
    const existingUsername = username ? await User.findOne({ username, _id: { $ne: req.userId }, deletedAt: null }) : null;
    if (existingUsername) return res.status(400).json({ message: 'Username is already taken.' });
    req.user.username = username;
  }

  if (req.body.firstName !== undefined || req.body.lastName !== undefined) {
    const fn = req.body.firstName !== undefined ? req.body.firstName : (req.user.name?.split(' ')[0] || '');
    const ln = req.body.lastName !== undefined ? req.body.lastName : (req.user.name?.split(' ').slice(1).join(' ') || '');
    req.user.name = `${fn} ${ln}`.trim() || req.user.name;
  }

  if (req.body.website) {
    const url = String(req.body.website).trim();
    if (url && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(url)) {
      return res.status(400).json({ message: 'Please enter a valid website URL.' });
    }
  }

  if (req.body.bio && String(req.body.bio).length > 500) {
    return res.status(400).json({ message: 'Bio cannot exceed 500 characters.' });
  }

  const allowed = ['name', 'avatar', 'coverImage', 'bio', 'phone', 'location', 'website', 'settings', 'connectedAccounts'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();
  return res.json({ result: req.user.toSafeObject() });
};

export const storageUsage = async (req, res) => {
  const photos = await PostMessage.find({ owner: req.userId });
  const totalStorage = photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
  const QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GiB = 5,368,709,120 bytes
  const storageLimit = Math.max(req.user.storageLimit || 0, QUOTA_BYTES);
  const remainingStorage = Math.max(0, storageLimit - totalStorage);

  if (req.user.storageLimit !== QUOTA_BYTES) {
    req.user.storageLimit = QUOTA_BYTES;
    await req.user.save().catch(() => {});
  }

  return res.json({
    totalStorage,
    storageLimit: QUOTA_BYTES,
    remainingStorage,
    photoCount: photos.filter((p) => !p.isDeleted).length,
    trashedCount: photos.filter((p) => p.isDeleted).length,
    percentUsed: Number(((totalStorage / QUOTA_BYTES) * 100).toFixed(2)),
  });
};

export const exportBackup = async (req, res) => {
  try {
    const photos = await PostMessage.find({ owner: req.userId });
    const albums = await Album.find({ owner: req.userId });
    const safeUser = req.user.toSafeObject();

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        name: safeUser.name,
        email: safeUser.email,
        username: safeUser.username,
        bio: safeUser.bio,
        location: safeUser.location,
        website: safeUser.website,
        phone: safeUser.phone,
        settings: safeUser.settings,
      },
      photos: photos.map((p) => ({
        title: p.title,
        message: p.message,
        selectedFile: p.selectedFile,
        cloudinaryUrl: p.cloudinaryUrl,
        cloudinaryPublicId: p.cloudinaryPublicId,
        tags: p.tags,
        fileName: p.fileName,
        fileType: p.fileType,
        size: p.size,
        width: p.width,
        height: p.height,
        folder: p.folder,
        visibility: p.visibility,
        transformations: p.transformations,
        favoriteBy: p.favoriteBy,
        createdAt: p.createdAt,
      })),
      albums: albums.map((a) => ({
        name: a.name,
        description: a.description,
        coverImage: a.coverImage,
        visibility: a.visibility,
        createdAt: a.createdAt,
      })),
    };

    return res.json({ ok: true, backup: backupData });
  } catch (error) {
    return res.status(500).json({ message: 'Backup export failed.' });
  }
};

export const restoreBackup = async (req, res) => {
  try {
    const { backup } = req.body;
    if (!backup || !Array.isArray(backup.photos)) {
      return res.status(400).json({ message: 'Invalid backup file payload.' });
    }

    if (backup.user) {
      const allowed = ['bio', 'phone', 'location', 'website', 'settings'];
      allowed.forEach((f) => {
        if (backup.user[f] !== undefined) req.user[f] = backup.user[f];
      });
      await req.user.save();
    }

    let restoredAlbums = 0;
    if (Array.isArray(backup.albums)) {
      for (const alb of backup.albums) {
        const exists = await Album.findOne({ owner: req.userId, name: alb.name, isDeleted: false });
        if (!exists) {
          await Album.create({
            name: alb.name,
            description: alb.description || '',
            coverImage: alb.coverImage || '',
            visibility: alb.visibility || 'private',
            owner: req.userId,
            creator: req.user.name,
          });
          restoredAlbums++;
        }
      }
    }

    let restoredPhotos = 0;
    const FIVE_GB = 5 * 1024 * 1024 * 1024;
    const existingUserPhotos = await PostMessage.find({ owner: req.userId });
    let currentStorage = existingUserPhotos.reduce((sum, item) => sum + (item.size || 0), 0);

    for (const ph of backup.photos) {
      const exists = await PostMessage.findOne({
        owner: req.userId,
        title: ph.title,
        fileName: ph.fileName || ph.title,
        size: ph.size || 0,
      });

      if (!exists) {
        const itemSize = Number(ph.size || 0);
        if (currentStorage + itemSize > (req.user.storageLimit || FIVE_GB)) {
          break;
        }

        await PostMessage.create({
          title: ph.title || 'Restored photo',
          message: ph.message || '',
          selectedFile: ph.selectedFile || ph.cloudinaryUrl || '',
          cloudinaryUrl: ph.cloudinaryUrl || '',
          cloudinaryPublicId: ph.cloudinaryPublicId || '',
          creator: req.user.name,
          owner: req.userId,
          tags: ph.tags || [],
          fileName: ph.fileName || ph.title || '',
          fileType: ph.fileType || '',
          size: itemSize,
          width: ph.width,
          height: ph.height,
          folder: ph.folder || 'library',
          visibility: ph.visibility || 'private',
          transformations: ph.transformations || {},
        });
        currentStorage += itemSize;
        restoredPhotos++;
      }
    }

    return res.json({
      ok: true,
      restoredPhotos,
      restoredAlbums,
      message: `Backup restoration complete. Restored ${restoredPhotos} photos and ${restoredAlbums} albums.`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Backup restoration failed.' });
  }
};

export const deleteAccount = async (req, res) => {
  req.user.deletedAt = new Date();
  req.user.refreshTokens = [];
  await req.user.save();
  await PostMessage.updateMany({ owner: req.userId }, { isDeleted: true, deletedAt: new Date() });
  await Album.updateMany({ owner: req.userId }, { isDeleted: true, deletedAt: new Date() });

  return res.json({ message: 'Account deleted successfully.' });
};

export const searchUsers = async (req, res) => {
  const { q = '' } = req.query;
  const regex = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({
    deletedAt: null,
    $or: [{ name: regex }, { username: regex }],
  }).limit(25);

  return res.json(users.map((user) => user.toSafeObject()));
};

export const publicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'name username avatar lastLoginAt settings').populate('following', 'name username avatar lastLoginAt settings');
  if (!user || user.deletedAt) return res.status(404).json({ message: 'User not found.' });
  const isOwner = String(req.userId || '') === String(user._id);
  const mediaQuery = isOwner
    ? { owner: user._id, isDeleted: false }
    : { owner: user._id, visibility: 'public', isDeleted: false };
  const albumQuery = isOwner
    ? { owner: user._id, isDeleted: false }
    : { owner: user._id, visibility: 'public', isDeleted: false };

  const [photos, albums, ownedMedia] = await Promise.all([
    PostMessage.find(mediaQuery).sort({ createdAt: -1 }),
    Album.find(albumQuery).sort({ createdAt: -1 }),
    PostMessage.find({ owner: user._id, isDeleted: false }).select('likeCount comments fileType'),
  ]);
  const favorites = await PostMessage.find({ favoriteBy: user._id, isDeleted: false, ...mediaQuery }).sort({ createdAt: -1 }).limit(50);
  const activity = isOwner ? await Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(50) : [];

  const safe = user.toSafeObject();
  if (!isOwner) {
    delete safe.email;
    delete safe.phone;
    delete safe.loginHistory;
    delete safe.settings;
    delete safe.connectedAccounts;
  }

  return res.json({
    user: safe,
    photos,
    videos: photos.filter((photo) => String(photo.fileType || '').startsWith('video/')),
    albums,
    favorites,
    activity,
    statistics: {
      publicPhotos: photos.filter((photo) => !String(photo.fileType || '').startsWith('video/')).length,
      publicVideos: photos.filter((photo) => String(photo.fileType || '').startsWith('video/')).length,
      publicAlbums: albums.length,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      totalPhotos: ownedMedia.filter((photo) => !String(photo.fileType || '').startsWith('video/')).length,
      totalAlbums: await Album.countDocuments({ owner: user._id, isDeleted: false }),
      sharedPhotos: await PostMessage.countDocuments({ owner: user._id, visibility: 'shared', isDeleted: false }),
      likes: ownedMedia.reduce((sum, photo) => sum + (photo.likeCount || 0), 0),
      comments: ownedMedia.reduce((sum, photo) => sum + (photo.comments?.length || 0), 0),
      views: photos.reduce((sum, photo) => sum + (photo.viewCount || 0), 0),
      downloads: photos.reduce((sum, photo) => sum + (photo.downloadCount || 0), 0),
    },
  });
};

export const socialConnections = async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'name username avatar bio').populate('following', 'name username avatar bio');
  if (!user || user.deletedAt) return res.status(404).json({ message: 'User not found.' });
  return res.json({ followers: user.followers || [], following: user.following || [] });
};

export const followUser = async (req, res) => {
  if (String(req.params.id) === String(req.userId)) return res.status(400).json({ message: 'You cannot follow yourself.' });

  const target = await User.findById(req.params.id);
  if (!target || target.deletedAt) return res.status(404).json({ message: 'User not found.' });

  await User.findByIdAndUpdate(req.userId, { $addToSet: { following: target._id } });
  await User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.userId } });
  await Notification.create({
    user: target._id,
    actor: req.userId,
    type: 'follow',
    title: 'New follower',
    message: `${req.user.name} started following you.`,
  });

  const updatedTarget = await User.findById(target._id).populate('followers', 'name username avatar').populate('following', 'name username avatar');
  const updatedRequester = await User.findById(req.userId).populate('followers', 'name username avatar').populate('following', 'name username avatar');

  return res.json({ message: 'User followed.', target: updatedTarget.toSafeObject(), requester: updatedRequester.toSafeObject() });
};

export const unfollowUser = async (req, res) => {
  await User.findByIdAndUpdate(req.userId, { $pull: { following: req.params.id } });
  await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.userId } });
  const updatedTarget = await User.findById(req.params.id).populate('followers', 'name username avatar').populate('following', 'name username avatar');
  const updatedRequester = await User.findById(req.userId).populate('followers', 'name username avatar').populate('following', 'name username avatar');
  return res.json({ message: 'User unfollowed.', target: updatedTarget.toSafeObject(), requester: updatedRequester.toSafeObject() });
};

export const sendFriendRequest = async (req, res) => {
  if (String(req.params.id) === String(req.userId)) return res.status(400).json({ message: 'You cannot send a request to yourself.' });
  const target = await User.findById(req.params.id);
  if (!target || target.deletedAt) return res.status(404).json({ message: 'User not found.' });

  const alreadyPending = target.friendRequests?.some((request) => String(request.from) === String(req.userId) && request.status === 'pending');
  if (alreadyPending) return res.json({ message: 'Friend request already pending.' });

  target.friendRequests.push({ from: req.userId, status: 'pending' });
  await target.save();
  await Notification.create({
    user: target._id,
    actor: req.userId,
    type: 'friend_request',
    title: 'Friend request',
    message: `${req.user.name} sent you a friend request.`,
  });

  return res.status(201).json({ message: 'Friend request sent.' });
};

export const getFriendRequests = async (req, res) => {
  const user = await User.findById(req.userId).populate('friendRequests.from', 'name username avatar bio');
  return res.json((user.friendRequests || []).filter((request) => request.status === 'pending'));
};

export const acceptFriendRequest = async (req, res) => {
  const user = await User.findById(req.userId);
  const request = user.friendRequests.id(req.params.requestId);
  if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Friend request not found.' });

  request.status = 'accepted';
  request.respondedAt = new Date();
  await user.save();
  await User.findByIdAndUpdate(req.userId, { $addToSet: { followers: request.from, following: request.from } });
  await User.findByIdAndUpdate(request.from, { $addToSet: { followers: req.userId, following: req.userId } });
  await Notification.create({
    user: request.from,
    actor: req.userId,
    type: 'friend_request',
    title: 'Friend request accepted',
    message: `${req.user.name} accepted your friend request.`,
  });

  return res.json({ message: 'Friend request accepted.' });
};

export const rejectFriendRequest = async (req, res) => {
  const user = await User.findById(req.userId);
  const request = user.friendRequests.id(req.params.requestId);
  if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Friend request not found.' });

  request.status = 'rejected';
  request.respondedAt = new Date();
  await user.save();
  return res.json({ message: 'Friend request rejected.' });
};

export const logUserActivity = async (userId, action, req, metadata = {}) => {
  if (!userId) return;
  try {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '';
    const userAgent = req?.headers?.['user-agent'] || '';
    await AuditLog.create({ user: userId, action, ip, userAgent, metadata });
  } catch (err) {
    console.error('AuditLog error:', err);
  }
};

export const blockUser = async (req, res) => {
  const { id } = req.params;
  if (String(id) === String(req.userId)) return res.status(400).json({ message: 'You cannot block yourself.' });
  const target = await User.findById(id);
  if (!target || target.deletedAt) return res.status(404).json({ message: 'User not found.' });

  await User.findByIdAndUpdate(req.userId, { $addToSet: { blockedUsers: target._id }, $pull: { followers: target._id, following: target._id } });
  await User.findByIdAndUpdate(target._id, { $pull: { followers: req.userId, following: req.userId } });
  await logUserActivity(req.userId, 'block_user', req, { targetUser: target._id });

  return res.json({ message: `${target.name} has been blocked.` });
};

export const unblockUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(req.userId, { $pull: { blockedUsers: id } });
  await logUserActivity(req.userId, 'unblock_user', req, { targetUser: id });
  return res.json({ message: 'User has been unblocked.' });
};

export const getAuditLog = async (req, res) => {
  const logs = await AuditLog.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
  return res.json(logs);
};

export const updatePrivacySettings = async (req, res) => {
  const { whoCanMessage, whoCanComment, profileVisibility } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.privacy = {
    whoCanMessage: whoCanMessage || user.privacy?.whoCanMessage || 'everyone',
    whoCanComment: whoCanComment || user.privacy?.whoCanComment || 'everyone',
    profileVisibility: profileVisibility || user.privacy?.profileVisibility || 'public',
  };
  await user.save();
  await logUserActivity(req.userId, 'update_privacy', req);
  return res.json({ privacy: user.privacy });
};
