import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadChatFile } from '../utils/upload.js';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

router.post('/chat', authenticate, uploadChatFile.single('file'), uploadController.uploadChatFile);

export default router;
