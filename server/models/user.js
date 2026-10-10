import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: String,
  coverImage: String,
  bio: String,
  username: {
    type: String,
    trim: true,
    sparse: true,
  },
  phone: String,
  location: String,
  website: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  storageLimit: {
    type: Number,
    default: 5 * 1024 * 1024 * 1024,
  },
  settings: {
    rememberMe: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    uploadNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'English' },
    theme: { type: String, default: 'Midnight' },
    autoBackup: { type: Boolean, default: false },
    imageCompression: { type: Boolean, default: true },
    downloadQuality: { type: String, default: 'Original' },
    privateProfile: { type: Boolean, default: false },
    watermarkText: { type: String, default: '' },
  },
  connectedAccounts: {
    google: {
      id: String,
      email: String,
      connectedAt: Date,
    },
    github: {
      id: String,
      username: String,
      connectedAt: Date,
    },
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: {
    whoCanMessage: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
    whoCanComment: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
  },
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date,
  }],
  loginHistory: [{
    at: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
  }],
  otpCode: String,
  otpHash: String,
  otpExpires: Date,
  otpAttempts: { type: Number, default: 0 },
  otpLastRequestedAt: Date,
  resetSessionToken: String,
  resetSessionExpires: Date,
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now },
  }],
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLoginAt: Date,
  deletedAt: Date,
  id: String,
}, { timestamps: true });

userSchema.methods.toSafeObject = function toSafeObject() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.emailVerificationToken;
  delete user.resetPasswordToken;
  delete user.resetSessionToken;
  delete user.otpHash;
  delete user.otpCode;
  delete user.loginHistory;
  user.storageLimit = Math.max(user.storageLimit || 0, 5 * 1024 * 1024 * 1024);
  if (typeof user.avatar === 'string' && user.avatar.startsWith('data:') && user.avatar.length > 200000) delete user.avatar;
  if (typeof user.coverImage === 'string' && user.coverImage.startsWith('data:') && user.coverImage.length > 200000) delete user.coverImage;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
