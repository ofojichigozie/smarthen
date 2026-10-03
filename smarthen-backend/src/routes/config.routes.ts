import { Router } from 'express';
import { getConfigHandler, updateConfigHandler } from '../controllers/config.controller';
import { authenticateAdmin, authenticateAny } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateConfigSchema } from '../validations/config.validation';

const router = Router();

router.get('/', authenticateAny, getConfigHandler);
router.put('/', authenticateAdmin, validate(updateConfigSchema), updateConfigHandler);

export default router;
