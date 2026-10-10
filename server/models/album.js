import mongoose from 'mongoose';

const albumSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  parentAlbum: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', default: null },
  coverPhoto: { type: mongoose.Schema.Types.ObjectId, ref: 'PostMessage', default: null },
  visibility: {
    type: String,
    enum: ['private', 'public', 'shared'],
    default: 'private',
  },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Kept for legacy shares; new shares use members with explicit permissions.
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'removed'], default: 'accepted' },
    joinedAt: { type: Date, default: Date.now },
  }],
  activity: [{
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, trim: true },
    message: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  }],
  tags: [{ type: String, trim: true, lowercase: true }],
  shareToken: { type: String, index: true },
  shareExpiresAt: Date,
  allowDownload: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

albumSchema.index({ name: 'text', description: 'text' });
albumSchema.index({ 'members.user': 1 });

export default mongoose.model('Album', albumSchema);
