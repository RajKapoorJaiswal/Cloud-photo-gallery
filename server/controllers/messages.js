import mongoose from 'mongoose';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import PostMessage from '../models/postMessage.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';

const validIds = (ids) => [...new Set((Array.isArray(ids) ? ids : []).filter((id) => mongoose.Types.ObjectId.isValid(id)).map(String))];
const conversationQuery = (userId) => ({ participants: userId });
const notifyMentions = async (text, actor, conversation) => {
  const usernames = [...new Set((String(text || '').match(/@([a-zA-Z0-9_.-]{3,30})/g) || []).map((item) => item.slice(1)))];
  if (!usernames.length) return;
  const users = await User.find({ username: { $in: usernames }, _id: { $ne: actor._id }, deletedAt: null }).select('_id');
  await Promise.all(users.map((user) => Notification.create({ user: user._id, actor: actor._id, type: 'mention', title: 'You were mentioned', message: `${actor.name} mentioned you in a message.` })));
};

export const getConversations = async (req, res) => {
  const conversations = await Conversation.find(conversationQuery(req.userId)).populate('participants', 'name username avatar lastLoginAt').populate('lastMessage').sort({ lastMessageAt: -1 });
  const result = await Promise.all(conversations.map(async (conversation) => ({
    ...conversation.toObject(),
    lastMessageStatus: conversation.lastMessage ? (conversation.lastMessage.readBy?.length >= conversation.participants.length ? 'seen' : conversation.lastMessage.readBy?.length > 1 ? 'delivered' : 'sent') : null,
    unreadCount: await Message.countDocuments({ conversation: conversation._id, sender: { $ne: req.userId }, deletedAt: null, readBy: { $ne: req.userId } }),
  })));
  res.json(result);
};

export const getMessages = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, ...conversationQuery(req.userId) });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
  await Message.updateMany({ conversation: conversation._id, sender: { $ne: req.userId }, readBy: { $ne: req.userId } }, { $addToSet: { readBy: req.userId } });
  const messages = await Message.find({ conversation: conversation._id }).populate('sender', 'name username avatar').populate('photos').populate({ path: 'replyTo', populate: { path: 'sender', select: 'name username' } }).sort({ createdAt: 1 });
  res.json({ conversation, messages });
};

export const createConversation = async (req, res) => {
  const participantIds = validIds(req.body.participantIds).filter((id) => id !== String(req.userId));
  if (!participantIds.length) return res.status(400).json({ message: 'Select at least one recipient.' });
  const users = await User.countDocuments({ _id: { $in: participantIds }, deletedAt: null });
  if (users !== participantIds.length) return res.status(400).json({ message: 'One or more recipients are invalid.' });
  const participants = [String(req.userId), ...participantIds].sort();
  let conversation = await Conversation.findOne({ participants: { $all: participants, $size: participants.length } });
  if (!conversation) conversation = await Conversation.create({ participants });
  await conversation.populate('participants', 'name username avatar lastLoginAt');
  res.status(201).json(conversation);
};

export const sendMessage = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, ...conversationQuery(req.userId) });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
  const photoIds = validIds(req.body.photoIds);
  const rawAttachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];
  const safeAttachments = rawAttachments.filter((att) => {
    const ext = String(att.fileName || '').split('.').pop().toLowerCase();
    return !['exe', 'bat', 'cmd', 'ps1', 'sh', 'vbs'].includes(ext);
  });

  if (!String(req.body.text || '').trim() && !photoIds.length && !safeAttachments.length) {
    return res.status(400).json({ message: 'A message, photo, or file attachment is required.' });
  }

  const ownedPhotos = photoIds.length ? await PostMessage.find({ _id: { $in: photoIds }, owner: req.userId, isDeleted: false }) : [];
  if (ownedPhotos.length !== photoIds.length) return res.status(403).json({ message: 'You can attach only your available photos.' });
  const replyTo = mongoose.Types.ObjectId.isValid(req.body.replyTo) ? await Message.findOne({ _id: req.body.replyTo, conversation: conversation._id, deletedAt: null }) : null;
  if (req.body.replyTo && !replyTo) return res.status(400).json({ message: 'The reply target is unavailable.' });

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.userId,
    text: req.body.text || '',
    photos: photoIds,
    attachments: safeAttachments,
    replyTo: replyTo?._id || null,
    readBy: [req.userId],
  });
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();
  const recipients = conversation.participants.filter((id) => String(id) !== String(req.userId));
  await Promise.all(recipients.map((user) => Notification.create({ user, actor: req.userId, type: 'message', title: 'New message', message: `${req.user.name} sent you a message.`, photo: photoIds[0] })));
  await notifyMentions(req.body.text, req.user, conversation);
  await message.populate('sender', 'name username avatar');
  await message.populate('photos');
  res.status(201).json(message);
};

export const deleteMessage = async (req, res) => {
  const message = await Message.findOneAndUpdate({ _id: req.params.messageId, sender: req.userId, deletedAt: null }, { deletedAt: new Date(), text: '' }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found.' });
  res.json(message);
};

export const reactToMessage = async (req, res) => {
  const { emoji } = req.body;
  if (!['❤️', '👍', '😂', '🔥', '😮', '😢'].includes(emoji)) return res.status(400).json({ message: 'Unsupported reaction.' });
  const message = await Message.findById(req.params.messageId);
  const allowed = message && await Conversation.exists({ _id: message.conversation, ...conversationQuery(req.userId) });
  if (!allowed) return res.status(404).json({ message: 'Message not found.' });
  message.reactions = (message.reactions || []).filter((reaction) => String(reaction.user) !== String(req.userId));
  message.reactions.push({ user: req.userId, emoji });
  await message.save();
  res.json(message);
};
