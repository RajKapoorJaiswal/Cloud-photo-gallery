import crypto from 'crypto';
import mongoose from 'mongoose';

import PostMessage from '../models/postMessage.js';
import Album from '../models/album.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import Download from '../models/download.js';
import Report from '../models/report.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  return String(tags || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const inferTags = (body) => {
  const text = `${body.title || ''} ${body.fileName || ''} ${body.message || ''}`.toLowerCase();
  const tags = [];
  const keywordGroups = [
    ['nature', ['tree', 'forest', 'flower', 'mountain', 'river', 'beach', 'sky', 'sunset', 'mahadev']],
    ['people', ['person', 'people', 'portrait', 'selfie', 'face', 'family', 'friend']],
    ['animal', ['dog', 'cat', 'bird', 'animal', 'pet']],
    ['object', ['car', 'bike', 'phone', 'laptop', 'watch', 'book']],
  ];

  keywordGroups.forEach(([tag, words]) => {
    if (words.some((word) => text.includes(word))) tags.push(tag);
  });

  if (body.width && body.height) {
    if (Number(body.width) > Number(body.height)) tags.push('landscape');
    if (Number(body.height) > Number(body.width)) tags.push('portrait');
  }

  if (body.fileType) tags.push(String(body.fileType).split('/').pop());

  return tags;
};

const notifyUser = async ({ user, actor, type, title, message = '', photo, album }) => {
  if (!user) return null;
  return Notification.create({ user, actor, type, title, message, photo, album });
};

const notifyMentions = async ({ text, actor, photo, type = 'mention' }) => {
  const usernames = [...new Set((String(text || '').match(/@([a-zA-Z0-9_.-]{3,30})/g) || []).map((item) => item.slice(1)))];
  if (!usernames.length) return;
  const mentioned = await User.find({ username: { $in: usernames }, deletedAt: null }).select('_id name');
  await Promise.all(mentioned.filter((user) => String(user._id) !== String(actor._id || actor)).map((user) => notifyUser({ user: user._id, actor: actor._id || actor, type, title: 'You were mentioned', message: `${actor.name || 'Someone'} mentioned you in a comment.`, photo })));
};

const requireObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ message: `No item with id: ${id}` });
    return false;
  }
  return true;
};

const accessQuery = (userId) => ({
  $or: [
    { owner: userId },
    { visibility: 'public' },
    { sharedWith: userId, visibility: 'shared', $or: [{ shareExpiresAt: null }, { shareExpiresAt: { $gt: new Date() } }] },
  ],
});

const albumAccessQuery = (userId) => ({
  $or: [{ owner: userId }, { visibility: 'public' }, { sharedWith: userId }, { members: { $elemMatch: { user: userId, status: 'accepted' } } }],
});

const getAuthorizedAlbumIdsForUser = async (userId) => {
  if (!userId) {
    const publicAlbums = await Album.find({ isDeleted: false, visibility: 'public' }).select('_id');
    return publicAlbums.map((a) => a._id);
  }
  const albums = await Album.find({
    isDeleted: false,
    $or: [
      { owner: userId },
      { visibility: 'public' },
      { sharedWith: userId },
      { members: { $elemMatch: { user: userId, status: 'accepted' } } },
    ],
  }).select('_id');
  return albums.map((a) => a._id);
};

const albumPermission = (album, userId) => {
  if (!userId) return null;
  if (String(album.owner?._id || album.owner) === String(userId)) return 'owner';
  const member = (album.members || []).find((item) => String(item.user?._id || item.user) === String(userId));
  if (member?.status === 'accepted' || !member?.status) return member.permission;
  return (album.sharedWith || []).map(String).includes(String(userId)) ? 'viewer' : null;
};

const canEditAlbum = (album, userId) => ['owner', 'editor'].includes(albumPermission(album, userId));
const albumActivity = (album, actor, type, message) => {
  album.activity = [...(album.activity || []).slice(-99), { actor, type, message }];
};

const mediaSummarySelect = '-__v';

export const calculateFileHash = (fileData) => {
  if (!fileData) return null;
  try {
    let buffer;
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const base64Str = fileData.split(',')[1] || '';
      buffer = Buffer.from(base64Str, 'base64');
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else {
      buffer = Buffer.from(String(fileData));
    }
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (err) {
    return null;
  }
};

export const calculatePerceptualHash = (fileData, size, width, height, fileName) => {
  const hash = calculateFileHash(fileData);
  if (!hash) return null;
  const normSize = Math.round((size || 0) / 1024);
  const aspect = (width && height) ? (width / height).toFixed(2) : '1.00';
  return `phash_${hash.substring(0, 16)}_${aspect}_${normSize}`;
};

const photoPayload = (body, user) => {
  const fileHash = body.fileHash || calculateFileHash(body.selectedFile || body.cloudinaryUrl);
  const perceptualHash = body.perceptualHash || calculatePerceptualHash(body.selectedFile || body.cloudinaryUrl, body.size, body.width, body.height, body.fileName);
  return {
    title: body.title || body.fileName || 'Untitled photo',
    message: body.message || body.description || '',
    fileHash,
    perceptualHash,
    selectedFile: body.selectedFile || body.cloudinaryUrl || '',
    cloudinaryUrl: body.cloudinaryUrl || '',
    cloudinaryPublicId: body.cloudinaryPublicId || '',
    creator: body.creator || user?.name || 'Unknown',
    owner: user?._id,
    tags: [...new Set([...parseTags(body.tags), ...inferTags(body)])],
    fileName: body.fileName || body.title || '',
    fileType: body.fileType || '',
    size: Number(body.size || 0),
    width: Number(body.width || 0) || undefined,
    height: Number(body.height || 0) || undefined,
    folder: body.folder || 'library',
    album: body.album || undefined,
    albums: body.album ? [body.album] : (body.albums || []),
    visibility: body.visibility || 'private',
    sharedWith: Array.isArray(body.sharedWith) ? [...new Set(body.sharedWith.map(String))] : [],
    shareExpiresAt: body.shareExpiresAt || undefined,
    allowReshare: body.allowReshare !== false,
    transformations: body.transformations || {},
  };
};

export const checkDuplicates = async (req, res) => {
  try {
    const photos = Array.isArray(req.body.photos) ? req.body.photos : (req.body.photo ? [req.body.photo] : []);
    if (!photos.length) return res.status(200).json({ duplicates: [] });

    const existingPhotos = await PostMessage.find({ owner: req.userId, isDeleted: false })
      .select('_id title fileName size selectedFile cloudinaryUrl createdAt fileHash perceptualHash width height');

    const duplicates = [];

    for (let i = 0; i < photos.length; i++) {
      const incoming = photos[i];
      const incomingHash = calculateFileHash(incoming.selectedFile);
      const incomingSize = Number(incoming.size || 0) || (incoming.selectedFile ? Math.round(incoming.selectedFile.length * 0.75) : 0);
      const incomingName = (incoming.fileName || incoming.title || '').trim().toLowerCase();

      let matchedExisting = null;
      let matchType = null;
      let message = '';

      // 1. Exact SHA-256 Hash Match
      if (incomingHash) {
        matchedExisting = existingPhotos.find((ex) => ex.fileHash && ex.fileHash === incomingHash);
        if (matchedExisting) {
          matchType = 'exact';
          message = 'Exact duplicate detected (SHA-256 content hash match).';
        }
      }

      // 2. Exact Data String Match
      if (!matchedExisting && incoming.selectedFile) {
        matchedExisting = existingPhotos.find((ex) => ex.selectedFile && ex.selectedFile === incoming.selectedFile);
        if (matchedExisting) {
          matchType = 'exact';
          message = 'Exact duplicate detected (Identical binary image payload).';
        }
      }

      // 3. Exact Filename and File Size Match
      if (!matchedExisting && incomingName && incomingSize > 0) {
        matchedExisting = existingPhotos.find((ex) => {
          const exName = (ex.fileName || ex.title || '').trim().toLowerCase();
          return exName === incomingName && Math.abs((ex.size || 0) - incomingSize) < 100;
        });
        if (matchedExisting) {
          matchType = 'exact';
          message = 'Exact duplicate detected (Identical filename and file size).';
        }
      }

      // 4. Perceptual / Visually Similar Match
      if (!matchedExisting && incomingName) {
        matchedExisting = existingPhotos.find((ex) => {
          const exName = (ex.fileName || ex.title || '').trim().toLowerCase();
          const baseInc = incomingName.split('.')[0];
          const baseEx = exName.split('.')[0];
          const nameMatch = baseInc.length > 2 && (baseInc.includes(baseEx) || baseEx.includes(baseInc));
          const sizeMatch = ex.size && incomingSize && Math.abs(ex.size - incomingSize) / ex.size < 0.1;
          return nameMatch && sizeMatch;
        });
        if (matchedExisting) {
          matchType = 'similar';
          message = 'Visually similar photo detected (matching filename structure & image scale).';
        }
      }

      if (matchedExisting) {
        duplicates.push({
          incomingIndex: i,
          incoming: {
            fileName: incoming.fileName || incoming.title || 'Uploaded Photo',
            size: incomingSize,
            selectedFile: incoming.selectedFile,
          },
          existing: {
            _id: matchedExisting._id,
            title: matchedExisting.title,
            fileName: matchedExisting.fileName,
            cloudinaryUrl: matchedExisting.cloudinaryUrl || matchedExisting.selectedFile,
            selectedFile: matchedExisting.selectedFile || matchedExisting.cloudinaryUrl,
            createdAt: matchedExisting.createdAt,
            size: matchedExisting.size,
          },
          matchType,
          message,
        });
      }
    }

    return res.status(200).json({ duplicates });
  } catch (error) {
    console.error('Error in checkDuplicates:', error);
    return res.status(500).json({ message: 'Error checking duplicates' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const {
      search = '',
      tag,
      user,
      album = 'all',
      date,
      dateRange = 'all',
      startDate,
      endDate,
      fileType = 'all',
      favorite = 'all',
      privacy = 'all',
      filter = '',
      sort = 'newest',
      page = 1,
      limit = 18,
      includeDeleted = 'false',
    } = req.query;

    const userAlbumIds = req.userId ? await getAuthorizedAlbumIdsForUser(req.userId) : [];
    const baseAccess = req.userId ? [
      { owner: req.userId },
      { visibility: 'public' },
      { sharedWith: req.userId, visibility: 'shared', $or: [{ shareExpiresAt: null }, { shareExpiresAt: { $gt: new Date() } }] },
      ...(userAlbumIds.length ? [{ album: { $in: userAlbumIds } }, { albums: { $in: userAlbumIds } }] : []),
    ] : [{ visibility: 'public' }];

    const query = { $or: baseAccess };
    const and = [query];

    if (includeDeleted !== 'true' && filter !== 'trash') {
      and.push({ isDeleted: false });
    }

    // Search query filter across title, fileName, tags, creator, folder, fileType, message, album names
    const cleanSearch = String(search).trim();
    if (cleanSearch) {
      const contains = new RegExp(escapeRegex(cleanSearch), 'i');
      const albumQuery = req.userId
        ? { isDeleted: false, name: contains, $or: [{ owner: req.userId }, { visibility: 'public' }, { sharedWith: req.userId }] }
        : { isDeleted: false, name: contains, visibility: 'public' };

      const matchingAlbums = await Album.find(albumQuery).select('_id');
      const matchingAlbumIds = matchingAlbums.map((item) => item._id);

      and.push({
        $or: [
          { title: contains },
          { fileName: contains },
          { tags: contains },
          { creator: contains },
          { folder: contains },
          { fileType: contains },
          { message: contains },
          ...(matchingAlbumIds.length ? [{ album: { $in: matchingAlbumIds } }, { albums: { $in: matchingAlbumIds } }] : []),
        ],
      });
    }

    if (tag) and.push({ tags: tag.toLowerCase() });
    if (user) and.push({ creator: new RegExp(escapeRegex(user), 'i') });

    // Album filter
    if (album && album !== 'all') {
      if (album === 'no_album') {
        and.push({
          $or: [
            { album: null },
            { album: { $exists: false } },
          ],
        });
      } else if (mongoose.Types.ObjectId.isValid(album)) {
        and.push({ $or: [{ album }, { albums: album }] });
      }
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        and.push({ createdAt: { $gte: startOfToday } });
      } else if (dateRange === 'last7') {
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        and.push({ createdAt: { $gte: d7 } });
      } else if (dateRange === 'last30') {
        const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        and.push({ createdAt: { $gte: d30 } });
      } else if (dateRange === 'custom') {
        const dateQuery = {};
        if (startDate) {
          const sDate = new Date(startDate);
          if (!isNaN(sDate.getTime())) dateQuery.$gte = sDate;
        }
        if (endDate) {
          const eDate = new Date(endDate);
          if (!isNaN(eDate.getTime())) {
            eDate.setHours(23, 59, 59, 999);
            dateQuery.$lte = eDate;
          }
        }
        if (Object.keys(dateQuery).length > 0) {
          and.push({ createdAt: dateQuery });
        }
      }
    } else if (date) {
      const start = new Date(date);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        and.push({ createdAt: { $gte: start, $lt: end } });
      }
    }

    // File type filter
    if (fileType && fileType !== 'all') {
      if (['jpeg', 'jpg', 'image/jpeg'].includes(fileType)) {
        and.push({ fileType: /jpeg|jpg/i });
      } else if (['png', 'image/png'].includes(fileType)) {
        and.push({ fileType: /png/i });
      } else if (['webp', 'image/webp'].includes(fileType)) {
        and.push({ fileType: /webp/i });
      } else if (fileType === 'other') {
        and.push({ fileType: { $not: /jpeg|jpg|png|webp/i } });
      } else {
        and.push({ fileType: new RegExp(escapeRegex(fileType), 'i') });
      }
    }

    // Favorite filter
    if (favorite === 'favorites' || filter === 'favorites') {
      if (req.userId) and.push({ favoriteBy: req.userId });
    } else if (favorite === 'non_favorites') {
      if (req.userId) and.push({ favoriteBy: { $ne: req.userId } });
    }

    // Legacy status filters
    if (filter === 'archived') and.push({ isArchived: true });
    if (filter === 'trash') and.push({ isDeleted: true });
    if (req.query.sharedWithMe === 'true' && req.userId) and.push({ sharedWith: req.userId });

    // Privacy filter
    if (privacy && privacy !== 'all') {
      if (['private', 'shared', 'public'].includes(privacy)) {
        and.push({ visibility: privacy });
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      nameAsc: { title: 1 },
      nameDesc: { title: -1 },
      largest: { size: -1 },
      smallest: { size: 1 },
      mostLiked: { likeCount: -1 },
      mostViewed: { viewCount: -1 },
      mostDownloaded: { downloadCount: -1 },
    };

    const safeLimit = Math.min(Number(limit) || 18, 60);
    const safePage = Math.max(Number(page) || 1, 1);
    const finalQuery = and.length > 1 ? { $and: and } : and[0];

    const [items, total] = await Promise.all([
      PostMessage.find(finalQuery).sort(sortMap[sort] || sortMap.newest).skip((safePage - 1) * safeLimit).limit(safeLimit),
      PostMessage.countDocuments(finalQuery),
    ]);

    res.status(200).json({ data: items, page: safePage, total, hasMore: safePage * safeLimit < total });
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
};

export const shareToUsers = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const { userIds = [], message = '', expiresAt } = req.body;
  if (!Array.isArray(userIds) || !userIds.length) return res.status(400).json({ message: 'No user ids provided.' });

  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  if (!post) return res.status(404).json({ message: 'Photo not found or accessible.' });

  const isOwner = String(post.owner) === String(req.userId);
  if (!isOwner && post.allowReshare === false) {
    return res.status(403).json({ message: 'Resharing is prohibited by the owner of this photo.' });
  }

  // ensure unique ids and valid ObjectIds
  const validIds = userIds.filter((u) => mongoose.Types.ObjectId.isValid(u) && String(u) !== String(req.userId));
  if (!validIds.length) return res.status(400).json({ message: 'No valid user ids provided.' });

  await PostMessage.findByIdAndUpdate(post._id, { $addToSet: { sharedWith: { $each: validIds } } }, { new: true });
  const updated = await PostMessage.findById(post._id);

  // notify receivers
  await Promise.all(validIds.map((uid) => Notification.create({
    user: uid,
    actor: req.userId,
    type: 'share',
    title: 'Photo shared',
    message: message || `${req.user.name} shared ${post.title} with you${isOwner ? '' : ` (originally by ${post.creator || 'Owner'})`}.`,
    photo: post._id,
  })));

  return res.json({ message: 'Shared successfully.', post: updated });
};

export const shareAlbumToUsers = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const { userIds = [], message = '' } = req.body;
  if (!Array.isArray(userIds) || !userIds.length) return res.status(400).json({ message: 'No user ids provided.' });

  const album = await Album.findOne({ _id: id, owner: req.userId });
  if (!album) return res.status(404).json({ message: 'Album not found or not owned by you.' });

  const validIds = userIds.filter((u) => mongoose.Types.ObjectId.isValid(u) && String(u) !== String(req.userId));
  if (!validIds.length) return res.status(400).json({ message: 'No valid user ids provided.' });

  const newMembers = validIds.map((user) => ({ user, permission: 'viewer', status: 'pending' }));
  await Album.findByIdAndUpdate(album._id, { $addToSet: { members: { $each: newMembers } }, visibility: 'shared' });
  const updated = await Album.findById(album._id);
  await Promise.all(validIds.map((uid) => Notification.create({ user: uid, actor: req.userId, type: 'album', title: 'Album invitation', message: message || `${req.user.name} invited you to ${album.name}.`, album: album._id })));

  return res.json({ message: 'Album shared successfully.', album: updated });
};

export const globalSearch = async (req, res) => {
  const { q = '' } = req.query;
  const clean = String(q).trim();
  if (!clean) return res.json({ media: [], albums: [], users: [] });

  const prefix = new RegExp(`^${escapeRegex(clean)}`, 'i');
  const contains = new RegExp(escapeRegex(clean), 'i');
  const mediaQuery = req.userId ? accessQuery(req.userId) : { visibility: 'public' };
  const albumQuery = req.userId
    ? { $or: [{ owner: req.userId }, { visibility: 'public' }, { sharedWith: req.userId }] }
    : { visibility: 'public' };

  const [matchingAlbums, users] = await Promise.all([
    Album.find({ isDeleted: false, ...albumQuery, $or: [{ name: contains }, { description: contains }] }).limit(10),
    User.find({ deletedAt: null, $or: [{ username: prefix }, { name: prefix }] }).limit(10),
  ]);

  const media = await PostMessage.find({
    isDeleted: false,
    ...mediaQuery,
    $or: [
      { title: prefix },
      { fileName: prefix },
      { tags: prefix },
      { creator: prefix },
      { message: contains },
      { fileType: contains },
      { folder: prefix },
      { album: { $in: matchingAlbums.map((album) => album._id) } },
      { albums: { $in: matchingAlbums.map((album) => album._id) } },
    ],
  }).sort({ createdAt: -1 }).limit(18);

  return res.json({
    media,
    albums: matchingAlbums,
    users: users.map((user) => user.toSafeObject()),
  });
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findById(id);
  if (!post || post.isDeleted) return res.status(404).json({ message: 'Photo not found.' });

  const isOwner = req.userId && String(post.owner) === String(req.userId);
  const isPublic = post.visibility === 'public';
  const isSharedWith = req.userId && (post.sharedWith || []).map(String).includes(String(req.userId)) && (!post.shareExpiresAt || new Date(post.shareExpiresAt) > new Date());

  let hasAlbumAccess = false;
  const albumIds = [post.album, ...(post.albums || [])].filter(Boolean);
  if (albumIds.length && req.userId) {
    const accessibleAlbum = await Album.findOne({
      _id: { $in: albumIds },
      isDeleted: false,
      $or: [
        { owner: req.userId },
        { visibility: 'public' },
        { sharedWith: req.userId },
        { members: { $elemMatch: { user: req.userId, status: 'accepted' } } },
      ],
    });
    if (accessibleAlbum) hasAlbumAccess = true;
  }

  if (!isOwner && !isPublic && !isSharedWith && !hasAlbumAccess) {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required to view this photo.' });
    }
    return res.status(403).json({ message: 'You do not have permission to view this photo.' });
  }

  post.viewCount += 1;
  await post.save();
  return res.status(200).json(post);
};

export const createPost = async (req, res) => {
  const payload = photoPayload(req.body, req.user);
  const targetAlbumId = payload.album || payload.albums?.[0];
  if (targetAlbumId) {
    const album = await Album.findById(targetAlbumId);
    if (!album || album.isDeleted || !canEditAlbum(album, req.userId)) return res.status(403).json({ message: 'You do not have permission to add media to this album.' });
  }

  const FIVE_GIB = 5 * 1024 * 1024 * 1024;
  const userPhotos = await PostMessage.find({ owner: req.userId });
  const currentUsed = userPhotos.reduce((sum, item) => sum + (item.size || 0), 0);
  const userQuota = Math.max(req.user.storageLimit || 0, FIVE_GIB);
  const availableBytes = Math.max(userQuota - currentUsed, 0);

  let incomingSize = Number(payload.size || 0);
  if (!incomingSize && payload.selectedFile && payload.selectedFile.startsWith('data:')) {
    incomingSize = Math.round(payload.selectedFile.length * 0.75);
    payload.size = incomingSize;
  }

  if (incomingSize > availableBytes) {
    const incomingMb = (incomingSize / (1024 * 1024)).toFixed(1);
    const availMb = (availableBytes / (1024 * 1024)).toFixed(1);
    return res.status(400).json({
      message: `Storage quota exceeded. Uploading this file (${incomingMb} MiB) would exceed your 5 GiB storage limit. Available remaining storage: ${availMb} MiB.`,
    });
  }
  const uploaded = await uploadToCloudinary({
    file: payload.selectedFile,
    folder: `cloud-photo-gallery/${req.userId}/${payload.folder || 'library'}`,
  });

  if (uploaded) {
    payload.cloudinaryUrl = uploaded.url;
    payload.cloudinaryPublicId = uploaded.publicId;
    payload.selectedFile = uploaded.url;
    payload.size = uploaded.bytes || payload.size;
    payload.width = uploaded.width || payload.width;
    payload.height = uploaded.height || payload.height;
    payload.fileType = payload.fileType || `image/${uploaded.format}`;
  }

  const newPostMessage = new PostMessage(payload);
  await newPostMessage.save();
  if (targetAlbumId) {
    const album = await Album.findById(targetAlbumId).select('members sharedWith visibility');
    const recipients = [...(album.members || []).map((member) => member.user), ...(album.sharedWith || [])];
    if (recipients.length) {
      newPostMessage.sharedWith = [...new Set(recipients.map(String))];
      newPostMessage.visibility = album.visibility === 'public' ? newPostMessage.visibility : 'shared';
      await newPostMessage.save();
    }
  }
  await notifyUser({ user: req.userId, actor: req.userId, type: 'upload', title: 'Upload complete', message: `${newPostMessage.title} was added to your library.`, photo: newPostMessage._id });
  res.status(201).json(newPostMessage);
};

export const createManyPosts = async (req, res) => {
  const photos = Array.isArray(req.body.photos) ? req.body.photos : [];
  if (!photos.length) return res.status(400).json({ message: 'At least one photo is required.' });

  const requestedAlbumIds = [...new Set(photos.flatMap((photo) => [photo.album, ...(photo.albums || [])]).filter(Boolean))];
  if (requestedAlbumIds.length) {
    const targetAlbums = await Album.find({ _id: { $in: requestedAlbumIds }, isDeleted: false });
    if (targetAlbums.length !== requestedAlbumIds.length || targetAlbums.some((album) => !canEditAlbum(album, req.userId))) return res.status(403).json({ message: 'You do not have permission to add media to one or more albums.' });
  }

  const FIVE_GIB = 5 * 1024 * 1024 * 1024;
  const userPhotos = await PostMessage.find({ owner: req.userId });
  const currentUsed = userPhotos.reduce((sum, item) => sum + (item.size || 0), 0);
  const userQuota = Math.max(req.user.storageLimit || 0, FIVE_GIB);
  const availableBytes = Math.max(userQuota - currentUsed, 0);

  const totalIncomingSize = photos.reduce((sum, item) => {
    let size = Number(item.size || 0);
    if (!size && item.selectedFile && item.selectedFile.startsWith('data:')) {
      size = Math.round(item.selectedFile.length * 0.75);
    }
    return sum + size;
  }, 0);

  if (totalIncomingSize > availableBytes) {
    const incomingMb = (totalIncomingSize / (1024 * 1024)).toFixed(1);
    const availMb = (availableBytes / (1024 * 1024)).toFixed(1);
    return res.status(400).json({
      message: `Storage quota exceeded. Uploading these ${photos.length} files (${incomingMb} MiB) would exceed your 5 GiB storage limit. Available remaining storage: ${availMb} MiB.`,
    });
  }
  const payloads = await Promise.all(photos.map(async (photo) => {
    const payload = photoPayload(photo, req.user);
    const uploaded = await uploadToCloudinary({
      file: payload.selectedFile,
      folder: `cloud-photo-gallery/${req.userId}/${payload.folder || 'library'}`,
    });
    if (uploaded) {
      payload.cloudinaryUrl = uploaded.url;
      payload.cloudinaryPublicId = uploaded.publicId;
      payload.selectedFile = uploaded.url;
      payload.size = uploaded.bytes || payload.size;
      payload.width = uploaded.width || payload.width;
      payload.height = uploaded.height || payload.height;
      payload.fileType = payload.fileType || `image/${uploaded.format}`;
    }
    return payload;
  }));

  const created = await PostMessage.insertMany(payloads);
  await notifyUser({ user: req.userId, actor: req.userId, type: 'upload', title: 'Bulk upload complete', message: `${created.length} files were added to your library.` });
  return res.status(201).json(created);
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findOne({ _id: id, owner: req.userId });
  if (!post) return res.status(404).json({ message: 'Photo not found.' });

  Object.assign(post, photoPayload({ ...post.toObject(), ...req.body }, req.user));
  await post.save();
  res.json(post);
};

export const updateTransformations = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findOneAndUpdate(
    { _id: id, owner: req.userId },
    { transformations: { ...(req.body || {}) } },
    { new: true },
  );

  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  return res.json(post);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findById(id);
  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  if (String(post.owner) !== String(req.userId)) {
    return res.status(403).json({ message: 'Only the original photo owner can move this photo to trash.' });
  }

  post.isDeleted = true;
  post.deletedAt = new Date();
  await post.save();
  res.json({ message: 'Photo moved to trash.', post });
};

export const restorePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findOneAndUpdate(
    { _id: id, owner: req.userId },
    { isDeleted: false, deletedAt: null },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  res.json(post);
};

export const permanentDeletePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findById(id);
  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  if (String(post.owner) !== String(req.userId)) {
    return res.status(403).json({ message: 'Only the original photo owner can permanently delete this photo.' });
  }

  await PostMessage.deleteOne({ _id: id });
  await deleteFromCloudinary(post.cloudinaryPublicId);
  res.json({ message: 'Photo permanently deleted.' });
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  if (!post) return res.status(404).json({ message: 'Photo not found.' });

  const userId = String(req.userId);
  const liked = post.likedBy.map(String).includes(userId);
  post.likedBy = liked ? post.likedBy.filter((item) => String(item) !== userId) : [...post.likedBy, req.userId];
  post.likeCount = post.likedBy.length;
  await post.save();
  if (!liked && String(post.owner) !== String(req.userId)) {
    await notifyUser({ user: post.owner, actor: req.userId, type: 'like', title: 'Like received', message: `${req.user.name} liked ${post.title}.`, photo: post._id });
  }

  res.json(post);
};

export const favoritePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  if (!post) return res.status(404).json({ message: 'Photo not found.' });

  const favorite = post.favoriteBy.map(String).includes(String(req.userId));
  post.favoriteBy = favorite ? post.favoriteBy.filter((item) => String(item) !== String(req.userId)) : [...post.favoriteBy, req.userId];
  await post.save();
  if (!favorite) await notifyUser({ user: req.userId, actor: req.userId, type: 'favorite', title: 'Favorite added', message: `${post.title} was added to favorites.`, photo: post._id });
  res.json(post);
};

export const archivePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const post = await PostMessage.findOneAndUpdate(
    { _id: id, owner: req.userId },
    { isArchived: Boolean(req.body.isArchived) },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  res.json(post);
};

export const sharePost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  if (!post) return res.status(404).json({ message: 'Photo not found or accessible.' });

  const isOwner = String(post.owner) === String(req.userId);
  if (!isOwner) {
    if (post.allowReshare === false) {
      return res.status(403).json({ message: 'Resharing is prohibited by the owner of this photo.' });
    }
  } else {
    if (typeof req.body.allowReshare === 'boolean') post.allowReshare = req.body.allowReshare;
    if (req.body.visibility && ['public', 'shared'].includes(req.body.visibility)) {
      post.visibility = req.body.visibility;
    }
    if (req.body.allowDownload !== undefined) post.allowDownload = req.body.allowDownload !== false;
    if (req.body.expiresAt) post.shareExpiresAt = new Date(req.body.expiresAt);
  }

  post.shareToken = post.shareToken || crypto.randomBytes(18).toString('hex');
  await post.save();
  if (isOwner) {
    await notifyUser({ user: req.userId, actor: req.userId, type: 'share', title: 'Shared photo', message: `${post.title} is now ${post.visibility}.`, photo: post._id });
  }

  res.json({ post, shareUrl: `${req.protocol}://${req.get('host')}/posts/shared/${post.shareToken}` });
};

export const getSharedPost = async (req, res) => {
  const post = await PostMessage.findOne({
    shareToken: req.params.token,
    isDeleted: false,
    visibility: { $in: ['public', 'shared'] },
    $or: [{ shareExpiresAt: null }, { shareExpiresAt: { $gt: new Date() } }],
  });
  if (!post) return res.status(404).json({ message: 'Shared photo not found or expired.' });
  res.json(post);
};

export const downloadPost = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  post.downloadCount += 1;
  await post.save();
  const url = post.cloudinaryUrl || post.selectedFile;
  const fileName = post.fileName || `${post.title}.jpg`;
  await Download.create({ user: req.userId, photo: post._id, fileName, fileSize: post.size, url });
  await notifyUser({ user: req.userId, actor: req.userId, type: 'download', title: 'Download complete', message: `${fileName} was downloaded.`, photo: post._id });
  res.json({ url, fileName, post });
};

export const batchUpdate = async (req, res) => {
  const { ids = [], action, album } = req.body;
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!objectIds.length) return res.status(400).json({ message: 'No valid photo ids provided.' });

  const update = {};
  if (action === 'archive') update.isArchived = true;
  if (action === 'unarchive') update.isArchived = false;
  if (action === 'delete') Object.assign(update, { isDeleted: true, deletedAt: new Date() });
  if (action === 'restore') Object.assign(update, { isDeleted: false, deletedAt: null });
  if (action === 'addToAlbum' && album) update.$addToSet = { albums: album };

  if (action === 'addToAlbum') {
    const targetAlbum = await Album.findById(album);
    if (!targetAlbum || targetAlbum.isDeleted || !canEditAlbum(targetAlbum, req.userId)) return res.status(403).json({ message: 'You do not have permission to add media to this album.' });
  }

  await PostMessage.updateMany({ _id: { $in: objectIds }, owner: req.userId }, update);
  const posts = await PostMessage.find({ _id: { $in: objectIds }, owner: req.userId });
  res.json(posts);
};

export const addComment = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;
  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  if (!post) return res.status(404).json({ message: 'Photo not found.' });

  post.comments.push({ user: req.userId, userName: req.user.name, text: req.body.text, emoji: req.body.emoji });
  await post.save();
  if (String(post.owner) !== String(req.userId)) {
    await notifyUser({ user: post.owner, actor: req.userId, type: 'comment', title: 'Comment received', message: `${req.user.name} commented on ${post.title}.`, photo: post._id });
  }
  await notifyMentions({ text: req.body.text, actor: req.user, photo: post._id });
  res.status(201).json(post);
};

export const updateComment = async (req, res) => {
  const { id, commentId } = req.params;
  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  const comment = post?.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });
  if (String(comment.user) !== String(req.userId)) return res.status(403).json({ message: 'You can edit only your comment.' });

  comment.text = req.body.text;
  comment.emoji = req.body.emoji;
  comment.updatedAt = new Date();
  await post.save();
  res.json(post);
};

export const deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const post = await PostMessage.findOne({ _id: id, isDeleted: false, ...accessQuery(req.userId) });
  const comment = post?.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });
  if (String(comment.user) !== String(req.userId) && String(post.owner) !== String(req.userId)) {
    return res.status(403).json({ message: 'You cannot delete this comment.' });
  }
  comment.remove();
  await post.save();
  res.json(post);
};

export const addReply = async (req, res) => {
  const { id, commentId } = req.params;
  const post = await PostMessage.findOne({ _id: id, ...accessQuery(req.userId) });
  const comment = post?.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });

  comment.replies.push({ user: req.userId, userName: req.user.name, text: req.body.text, emoji: req.body.emoji });
  await post.save();
  if (String(comment.user) !== String(req.userId)) await notifyUser({ user: comment.user, actor: req.userId, type: 'comment_reply', title: 'Comment reply', message: `${req.user.name} replied to your comment.`, photo: post._id });
  await notifyMentions({ text: req.body.text, actor: req.user, photo: post._id });
  res.status(201).json(post);
};

export const createAlbum = async (req, res) => {
  const album = await Album.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.userId,
    parentAlbum: req.body.parentAlbum || null,
    coverPhoto: req.body.coverPhoto || null,
    visibility: req.body.visibility || 'private',
  });
  await notifyUser({ user: req.userId, actor: req.userId, type: 'album', title: 'Album created', message: `${album.name} was created.`, album: album._id });
  res.status(201).json(album);
};

export const getAlbums = async (req, res) => {
  const albums = await Album.find({ isDeleted: false, ...albumAccessQuery(req.userId) }).populate('owner', 'name username avatar').populate('members.user', 'name username avatar').sort({ createdAt: -1 });
  res.json(albums);
};

export const getAlbum = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid album id",
    });
  }

  const album = await Album.findById(id)
    .populate("owner", "name username avatar")
    .populate("members.user", "name username avatar");

  if (!album || album.isDeleted) {
    return res.status(404).json({
      message: "Album not found.",
    });
  }

  const isOwner = req.userId && String(album.owner?._id || album.owner) === String(req.userId);
  const memberObj = req.userId ? (album.members || []).find((m) => String(m.user?._id || m.user) === String(req.userId)) : null;
  const isAcceptedMember = memberObj && (memberObj.status === 'accepted' || !memberObj.status);
  const isSharedWith = req.userId && (album.sharedWith || []).map(String).includes(String(req.userId));
  const isPublic = album.visibility === 'public';

  if (!isOwner && !isAcceptedMember && !isSharedWith && !isPublic) {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required to view this album.' });
    }
    return res.status(403).json({ message: 'You do not have permission to view this album.' });
  }

  const files = await PostMessage.find({
    isDeleted: false,
    $or: [{ album: album._id }, { albums: album._id }],
  }).sort({ createdAt: -1 });

  const photos = files.filter(
    (item) => !String(item.fileType || "").startsWith("video/")
  );
  const videos = files.filter((item) =>
    String(item.fileType || "").startsWith("video/")
  );

  return res.json({
    album,
    photos,
    videos,
    files,
    counts: {
      photos: photos.length,
      videos: videos.length,
      total: files.length,
    },
  });
};
export const updateAlbum = async (req, res) => {
  const album = await Album.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    {
      name: req.body.name,
      description: req.body.description,
      parentAlbum: req.body.parentAlbum || null,
      coverPhoto: req.body.coverPhoto || null,
      visibility: req.body.visibility || 'private',
    },
    { new: true },
  );
  if (!album) return res.status(404).json({ message: 'Album not found.' });
  res.json(album);
};

export const addAlbumMember = async (req, res) => {
  const { userId, permission = 'viewer' } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userId) || !['editor', 'viewer'].includes(permission)) return res.status(400).json({ message: 'A valid user and permission are required.' });
  const album = await Album.findOne({ _id: req.params.id, owner: req.userId, isDeleted: false });
  const user = await User.findOne({ _id: userId, deletedAt: null });
  if (!album || !user) return res.status(404).json({ message: 'Album or user not found.' });
  if (String(user._id) === String(req.userId)) return res.status(400).json({ message: 'The owner already has full access.' });
  const existing = album.members.find((member) => String(member.user) === String(user._id));
  if (existing) { existing.permission = permission; existing.status = 'pending'; existing.joinedAt = new Date(); }
  else album.members.push({ user: user._id, permission, status: 'pending' });
  album.visibility = 'shared';
  albumActivity(album, req.userId, 'invite', `${req.user.name} invited ${user.name} as ${permission}.`);
  await album.save();
  await notifyUser({ user: user._id, actor: req.userId, type: 'album', title: 'Album invitation', message: `${req.user.name} invited you to ${album.name} as an ${permission}.`, album: album._id });
  await album.populate('members.user', 'name username avatar');
  return res.json(album);
};

export const updateAlbumMember = async (req, res) => {
  const { permission } = req.body;
  if (!['editor', 'viewer'].includes(permission)) return res.status(400).json({ message: 'Permission must be editor or viewer.' });
  const album = await Album.findOne({ _id: req.params.id, owner: req.userId, isDeleted: false });
  const member = album?.members.find((item) => String(item.user) === String(req.params.userId));
  if (!member) return res.status(404).json({ message: 'Album member not found.' });
  member.permission = permission;
  member.status = member.status || 'accepted';
  albumActivity(album, req.userId, 'permission', `${req.user.name} changed a member to ${permission}.`);
  await album.save();
  await notifyUser({ user: member.user, actor: req.userId, type: 'album', title: 'Album permission changed', message: `Your access to ${album.name} is now ${permission}.`, album: album._id });
  await album.populate('members.user', 'name username avatar');
  return res.json(album);
};

export const removeAlbumMember = async (req, res) => {
  const album = await Album.findOne({ _id: req.params.id, owner: req.userId, isDeleted: false });
  if (!album) return res.status(404).json({ message: 'Album not found.' });
  const member = album.members.find((item) => String(item.user) === String(req.params.userId));
  if (!member) return res.status(404).json({ message: 'Album member not found.' });
  album.members = album.members.filter((item) => String(item.user) !== String(req.params.userId));
  album.sharedWith = (album.sharedWith || []).filter((item) => String(item) !== String(req.params.userId));
  albumActivity(album, req.userId, 'remove', `${req.user.name} removed a member.`);
  await album.save();
  await PostMessage.updateMany(
    { $or: [{ album: album._id }, { albums: album._id }] },
    { $pull: { sharedWith: req.params.userId } },
  );
  await notifyUser({ user: req.params.userId, actor: req.userId, type: 'album', title: 'Album access removed', message: `Your access to ${album.name} was removed.`, album: album._id });
  return res.json({ message: 'Album member removed.' });
};

export const getAlbumInvitations = async (req, res) => {
  const albums = await Album.find({ isDeleted: false, members: { $elemMatch: { user: req.userId, status: 'pending' } } }).populate('owner', 'name username avatar').populate('members.user', 'name username avatar');
  return res.json(albums);
};

export const respondToAlbumInvitation = async (req, res) => {
  const { response } = req.body;
  if (!['accepted', 'declined'].includes(response)) return res.status(400).json({ message: 'Response must be accepted or declined.' });
  const album = await Album.findOne({ _id: req.params.id, isDeleted: false, members: { $elemMatch: { user: req.userId, status: 'pending' } } });
  if (!album) return res.status(404).json({ message: 'Album invitation not found.' });
  const member = album.members.find((item) => String(item.user) === String(req.userId));
  member.status = response;
  if (response === 'accepted') {
    member.joinedAt = new Date();
    album.sharedWith = [...new Set([...(album.sharedWith || []).map(String), String(req.userId)])];
    await PostMessage.updateMany({ isDeleted: false, $or: [{ album: album._id }, { albums: album._id }] }, { $addToSet: { sharedWith: req.userId } });
  }
  albumActivity(album, req.userId, response === 'accepted' ? 'join' : 'decline', `${req.user.name} ${response} the album invitation.`);
  await album.save();
  await notifyUser({ user: album.owner, actor: req.userId, type: 'album', title: 'Album invitation response', message: `${req.user.name} ${response} your invitation to ${album.name}.`, album: album._id });
  return res.json(album);
};

export const revokePhotoShare = async (req, res) => {
  const { id } = req.params;
  if (!requireObjectId(id, res)) return;

  const post = await PostMessage.findOne({
    _id: id,
    isDeleted: false,
    $or: [{ owner: req.userId }, { sharedWith: req.userId }],
  });
  if (!post) return res.status(404).json({ message: 'Photo not found or accessible.' });

  const isOwner = String(post.owner) === String(req.userId);
  const targetUserId = req.body?.userId;

  if (isOwner) {
    if (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)) {
      post.sharedWith = (post.sharedWith || []).filter((item) => String(item) !== String(targetUserId));
    } else {
      post.sharedWith = [];
      post.shareToken = undefined;
      post.shareExpiresAt = undefined;
      post.visibility = 'private';
    }
  } else {
    // Recipient removing photo from their "Shared with Me" list
    post.sharedWith = (post.sharedWith || []).filter((item) => String(item) !== String(req.userId));
  }

  await post.save();
  return res.json({ message: isOwner ? 'Share access updated.' : 'Photo removed from Shared with Me.', post });
};

export const deleteAlbum = async (req, res) => {
  const album = await Album.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!album) return res.status(404).json({ message: 'Album not found.' });
  await notifyUser({ user: req.userId, actor: req.userId, type: 'album', title: 'Album deleted', message: `${album.name} was moved to trash.`, album: album._id });
  res.json({ message: 'Album deleted.', album });
};

export const shareAlbum = async (req, res) => {
  const album = await Album.findOne({ _id: req.params.id, owner: req.userId, isDeleted: false });
  if (!album) return res.status(404).json({ message: 'Album not found.' });

  if (req.body.visibility && !['public', 'shared'].includes(req.body.visibility)) return res.status(400).json({ message: 'Shared albums must be public or shared.' });
  album.visibility = req.body.visibility || 'shared';
  album.shareToken = album.shareToken || crypto.randomBytes(18).toString('hex');
  album.shareExpiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
  album.allowDownload = req.body.allowDownload !== false;
  await album.save();
  await notifyUser({ user: req.userId, actor: req.userId, type: 'share', title: 'Shared album', message: `${album.name} is now ${album.visibility}.`, album: album._id });

  return res.json({ album, shareUrl: `${req.protocol}://${req.get('host')}/posts/shared/album/${album.shareToken}` });
};

export const getSharedAlbum = async (req, res) => {
  const album = await Album.findOne({
    shareToken: req.params.token,
    isDeleted: false,
    visibility: { $in: ['public', 'shared'] },
    $or: [{ shareExpiresAt: null }, { shareExpiresAt: { $gt: new Date() } }],
  }).populate('owner', 'name username avatar');
  if (!album) return res.status(404).json({ message: 'Shared album not found or expired.' });

  const files = await PostMessage.find({
    isDeleted: false,
    $or: [{ album: album._id }, { albums: album._id }],
    visibility: { $in: ['public', 'shared'] },
  }).sort({ createdAt: -1 });

  return res.json({ album, files });
};

export const getDownloads = async (req, res) => {
  const downloads = await Download.find({ user: req.userId }).populate('photo').sort({ createdAt: -1 });
  res.json(downloads);
};

export const deleteDownload = async (req, res) => {
  await Download.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ message: 'Download history deleted.' });
};

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  res.json(notification);
};

export const deleteNotification = async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ message: 'Notification deleted.' });
};

export const dashboard = async (req, res) => {
  const [photos, albums, users, downloads, notifications] = await Promise.all([
    PostMessage.find({ owner: req.userId, isDeleted: false }).select(mediaSummarySelect).sort({ createdAt: -1 }).limit(8),
    Album.countDocuments({ owner: req.userId, isDeleted: false }),
    User.countDocuments({ deletedAt: null }),
    Download.find({ user: req.userId }).select('-url').populate({ path: 'photo', select: mediaSummarySelect }).sort({ createdAt: -1 }).limit(8),
    Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(8),
  ]);
  const allPhotos = await PostMessage.find({ owner: req.userId }).select(mediaSummarySelect);
  const activeMedia = allPhotos.filter((photo) => !photo.isDeleted);
  const activePhotos = activeMedia.filter((photo) => !String(photo.fileType || '').startsWith('video/'));
  const activeVideos = activeMedia.filter((photo) => String(photo.fileType || '').startsWith('video/'));
  const totalStorage = allPhotos.reduce((sum, photo) => sum + (photo.size || 0), 0);

  res.json({
    totalPhotos: activePhotos.length,
    totalVideos: activeVideos.length,
    albums,
    storage: totalStorage,
    recentUploads: photos,
    statistics: {
      favorites: allPhotos.filter((photo) => photo.favoriteBy.map(String).includes(String(req.userId))).length,
      archived: allPhotos.filter((photo) => photo.isArchived).length,
      trash: allPhotos.filter((photo) => photo.isDeleted).length,
      likes: allPhotos.reduce((sum, photo) => sum + photo.likeCount, 0),
      downloads: allPhotos.reduce((sum, photo) => sum + photo.downloadCount, 0),
      views: allPhotos.reduce((sum, photo) => sum + (photo.viewCount || 0), 0),
      followers: req.user.followers?.length || 0,
      following: req.user.following?.length || 0,
      usersVisibleToAdmin: req.user?.role === 'admin' ? users : undefined,
    },
    uploadsToday: allPhotos.filter((photo) => new Date(photo.createdAt).toDateString() === new Date().toDateString()).length,
    uploadsThisWeek: allPhotos.filter((photo) => Date.now() - new Date(photo.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length,
    uploadsThisMonth: allPhotos.filter((photo) => Date.now() - new Date(photo.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000).length,
    storageGrowth: allPhotos.reduce((sum, photo) => sum + (photo.size || 0), 0),
    mostViewed: allPhotos.slice().sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 6),
    mostDownloaded: allPhotos.slice().sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 6),
    mostLiked: allPhotos.slice().sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 6),
    recentDownloads: downloads,
    recentNotifications: notifications,
    activity: allPhotos.slice(-10).reverse(),
  });
};

export const adminOverview = async (_req, res) => {
  const [users, photos, albums, reports] = await Promise.all([
    User.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(50),
    PostMessage.find().sort({ createdAt: -1 }).limit(50),
    Album.find().sort({ createdAt: -1 }).limit(50),
    Report.find().populate('reporter', 'name username').sort({ createdAt: -1 }).limit(50),
  ]);
  res.json({
    users: users.map((user) => user.toSafeObject()),
    photos,
    albums,
    reports,
    analytics: {
      totalUsers: users.length,
      totalPhotos: photos.length,
      totalAlbums: albums.length,
      totalReports: reports.length,
      totalStorage: photos.reduce((sum, photo) => sum + (photo.size || 0), 0),
    },
  });
};

export const moderatePhoto = async (req, res) => {
  const post = await PostMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!post) return res.status(404).json({ message: 'Photo not found.' });
  res.json(post);
};

export const createReport = async (req, res) => {
  const { targetType, targetId, reason, details } = req.body;
  if (!targetType || !targetId || !reason) return res.status(400).json({ message: 'Target type, target ID and reason are required.' });
  if (!['photo', 'user', 'comment', 'album', 'message'].includes(targetType)) return res.status(400).json({ message: 'Invalid report target.' });
  if (!['spam', 'harassment', 'inappropriate', 'copyright', 'other'].includes(reason)) return res.status(400).json({ message: 'Invalid report reason.' });

  const report = await Report.create({
    reporter: req.userId,
    targetType,
    targetId,
    reason,
    details: details || '',
  });

  return res.status(201).json({ message: 'Report submitted successfully.', report });
};

export const getReports = async (req, res) => {
  const reports = await Report.find().populate('reporter', 'name username avatar').sort({ createdAt: -1 });
  return res.json(reports);
};

export const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'reviewed', 'resolved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid report status.' });

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, reviewedBy: req.userId, reviewedAt: new Date() },
    { new: true },
  );

  if (!report) return res.status(404).json({ message: 'Report not found.' });
  return res.json(report);
};
