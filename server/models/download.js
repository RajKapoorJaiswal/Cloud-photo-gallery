import mongoose from 'mongoose';

const downloadSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: 'PostMessage', required: true },
  fileName: String,
  fileSize: Number,
  url: String,
}, { timestamps: true });

export default mongoose.model('Download', downloadSchema);
