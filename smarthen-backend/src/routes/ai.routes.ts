import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.post('/chat', authenticate(['admin']), aiController.chat);

export default router;
