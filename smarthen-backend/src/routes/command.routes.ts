import { Router } from 'express';
import {
  createCommandHandler,
  deleteAllCommandsHandler,
  deleteCommandHandler,
  executeCommandHandler,
  getCommandHistoryHandler,
  getPendingHandler,
} from '../controllers/command.controller';
import { authenticateAdmin, authenticateHardware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommandSchema, executeCommandSchema } from '../validations/command.validation';

const router = Router();

router.get('/pending', authenticateHardware, getPendingHandler);
router.put('/execute', authenticateHardware, validate(executeCommandSchema), executeCommandHandler);

router.post('/', authenticateAdmin, validate(createCommandSchema), createCommandHandler);
router.get('/history', authenticateAdmin, getCommandHistoryHandler);
router.delete('/:id', authenticateAdmin, deleteCommandHandler);
router.delete('/', authenticateAdmin, deleteAllCommandsHandler);

export default router;
