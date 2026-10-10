import express from 'express';
import { auth } from '../middleware/auth.js';
import { createConversation, deleteMessage, getConversations, getMessages, reactToMessage, sendMessage } from '../controllers/messages.js';

const router = express.Router();
router.get('/', auth, getConversations);
router.post('/', auth, createConversation);
router.get('/:id/messages', auth, getMessages);
router.post('/:id/messages', auth, sendMessage);
router.delete('/:id/messages/:messageId', auth, deleteMessage);
router.patch('/:id/messages/:messageId/reactions', auth, reactToMessage);
export default router;
