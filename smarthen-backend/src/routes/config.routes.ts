import { Router } from 'express';
import { getConfigHandler, updateConfigHandler } from '../controllers/config.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateConfigSchema } from '../validations/config.validation';

const router = Router();

router.get('/', authenticate(['admin', 'hardware', 'service']), getConfigHandler);
router.put(
  '/',
  authenticate(['admin', 'service']),
  validate(updateConfigSchema),
  updateConfigHandler
);

export default router;
