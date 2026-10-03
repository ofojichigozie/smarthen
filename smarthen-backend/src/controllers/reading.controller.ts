import { Request, Response, NextFunction } from 'express';
import {
  saveReading,
  getLatestReading,
  getReadingsHistory,
  deleteReadingById,
  deleteAllReadings,
} from '../services/reading.service';
import { successify } from '../utils/response.util';

export const postSensorDataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reading = await saveReading(req.body);
    successify(res, 'Sensor data saved successfully', reading, 201);
  } catch (error) {
    next(error);
  }
};

export const getLatestReadingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reading = await getLatestReading().catch(() => null);
    successify(res, 'Latest reading retrieved', reading, 200);
  } catch (error) {
    next(error);
  }
};

export const getReadingsHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 20, skip = 0, from, to } = req.query;
    const result = await getReadingsHistory({
      limit: Number(limit),
      skip: Number(skip),
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    });
    successify(res, 'Reading history retrieved', result, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteReadingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteReadingById(id);
    successify(res, 'Reading deleted successfully', { id: deleted._id }, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteAllReadingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deleteAllReadings();
    successify(res, `${result.deletedCount} readings deleted successfully`, result, 200);
  } catch (error) {
    next(error);
  }
};
