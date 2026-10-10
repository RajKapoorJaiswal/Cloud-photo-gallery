import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['upload', 'download', 'like', 'favorite', 'comment', 'comment_reply', 'album', 'share', 'password', 'follow', 'friend_request', 'message', 'mention', 'system'],
    default: 'system',
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: 'PostMessage' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
