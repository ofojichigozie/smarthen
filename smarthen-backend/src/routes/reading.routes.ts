import { Router } from 'express';
import {
  deleteAllReadingsHandler,
  deleteReadingHandler,
  getReadingsHistoryHandler,
  getLatestReadingHandler,
  postSensorDataHandler,
} from '../controllers/reading.controller';
import { authenticateAdmin, authenticateHardware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sensorDataSchema } from '../validations/reading.validation';

const router = Router();

router.post(
  '/sensor-data',
  authenticateHardware,
  validate(sensorDataSchema),
  postSensorDataHandler
);

router.get('/latest', authenticateAdmin, getLatestReadingHandler);
router.get('/history', authenticateAdmin, getReadingsHistoryHandler);
router.delete('/:id', authenticateAdmin, deleteReadingHandler);
router.delete('/', authenticateAdmin, deleteAllReadingsHandler);

export default router;
