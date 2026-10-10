import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: { type: String, trim: true },
    emoji: String,
    replies: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        text: { type: String, trim: true },
        emoji: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: Date,
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
});

const postSchema = mongoose.Schema({
    title: { type: String, trim: true, required: true },
    message: { type: String, trim: true, default: '' },
    creator: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    fileHash: { type: String, index: true },
    perceptualHash: { type: String, index: true },
    selectedFile: String,
    fileName: String,
    fileType: String,
    size: { type: Number, default: 0 },
    width: Number,
    height: Number,
    cloudinaryPublicId: String,
    cloudinaryUrl: String,
    folder: { type: String, default: 'library' },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
    transformations: {
        crop: String,
        rotation: { type: Number, default: 0 },
        resizedWidth: Number,
        resizedHeight: Number,
        watermark: String,
        compressionQuality: Number,
    },
    favoriteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: {
        type: Number,
        default: 0,
    },
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    visibility: {
        type: String,
        enum: ['private', 'public', 'shared'],
        default: 'private',
    },
    shareToken: { type: String, index: true },
    shareExpiresAt: Date,
    allowDownload: { type: Boolean, default: true },
    allowReshare: { type: Boolean, default: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
}, { timestamps: true });

postSchema.index({ title: 'text', message: 'text', tags: 'text', creator: 'text', fileName: 'text' });

var PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;
