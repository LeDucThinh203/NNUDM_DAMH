import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as cartController from '../controllers/cartController.js';

const router = express.Router();

router.get('/me', authenticate, cartController.getMyCart);
router.post('/sync', authenticate, cartController.syncMyCart);
router.post('/items', authenticate, cartController.addItem);
router.put('/items', authenticate, cartController.updateItem);
router.delete('/items', authenticate, cartController.removeItem);
router.delete('/me', authenticate, cartController.clearMyCart);

export default router;
