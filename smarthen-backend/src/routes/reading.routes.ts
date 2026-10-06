import { Router } from 'express';
import {
  deleteAllReadingsHandler,
  deleteReadingHandler,
  getReadingsHistoryHandler,
  getLatestReadingHandler,
  postSensorDataHandler,
} from '../controllers/reading.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sensorDataSchema } from '../validations/reading.validation';

const router = Router();

router.post(
  '/sensor-data',
  authenticate(['hardware']),
  validate(sensorDataSchema),
  postSensorDataHandler
);

router.get('/latest', authenticate(['admin', 'service']), getLatestReadingHandler);
router.get('/history', authenticate(['admin', 'service']), getReadingsHistoryHandler);
router.delete('/:id', authenticate(['admin']), deleteReadingHandler);
router.delete('/', authenticate(['admin']), deleteAllReadingsHandler);

export default router;
