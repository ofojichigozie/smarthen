import { Router } from 'express';
import {
  createCommandHandler,
  deleteAllCommandsHandler,
  deleteCommandHandler,
  executeCommandHandler,
  getCommandHistoryHandler,
  getPendingHandler,
} from '../controllers/command.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommandSchema, executeCommandSchema } from '../validations/command.validation';

const router = Router();

router.get('/pending', authenticate(['hardware']), getPendingHandler);
router.put(
  '/execute',
  authenticate(['hardware']),
  validate(executeCommandSchema),
  executeCommandHandler
);

router.post(
  '/',
  authenticate(['admin', 'service']),
  validate(createCommandSchema),
  createCommandHandler
);
router.get('/history', authenticate(['admin', 'service']), getCommandHistoryHandler);
router.delete('/:id', authenticate(['admin']), deleteCommandHandler);
router.delete('/', authenticate(['admin']), deleteAllCommandsHandler);

export default router;
