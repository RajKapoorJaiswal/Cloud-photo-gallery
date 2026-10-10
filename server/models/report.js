import mongoose from 'mongoose';

const reportSchema = mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType: {
    type: String,
    enum: ['photo', 'user', 'comment', 'album', 'message'],
    required: true,
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'copyright', 'other'],
    required: true,
  },
  details: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true });

reportSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.model('Report', reportSchema);
