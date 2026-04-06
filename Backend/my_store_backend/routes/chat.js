import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.get('/users', authenticate, chatController.getChatUsers);
router.get('/messages/:userId', authenticate, chatController.getMessagesWithUser);

export default router;
