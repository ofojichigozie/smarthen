import Reading from '../models/reading.model';
import Config from '../models/config.model';
import { SensorDataInput } from '../validations/reading.validation';
import { AppError } from '../middleware/error.middleware';

export const saveReading = async (data: SensorDataInput) => {
  const reading = await Reading.create({
    timestamp: new Date(),
    ...data,
  });

  await Config.findOneAndUpdate(
    {},
    { deviceLastSeen: new Date(), deviceOnline: true },
    { upsert: true, new: true }
  );

  return reading;
};

export const getLatestReading = async () => {
  const reading = await Reading.findOne().sort({ timestamp: -1 });
  if (!reading) {
    throw new AppError('No readings available', 404);
  }
  return reading;
};

interface GetHistoryOptions {
  limit?: number;
  skip?: number;
  from?: Date;
  to?: Date;
}

export const getReadingsHistory = async (options: GetHistoryOptions = {}) => {
  const { limit = 20, skip = 0, from, to } = options;

  const filter: any = {};
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = from;
    if (to) filter.timestamp.$lte = to;
  }

  const [items, total] = await Promise.all([
    Reading.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    Reading.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  const page = Math.floor(skip / limit) + 1;

  return {
    items,
    pagination: {
      total,
      page,
      totalPages,
      limit,
      skip,
    },
  };
};

export const deleteReadingById = async (readingId: string) => {
  const reading = await Reading.findById(readingId);
  if (!reading) {
    throw new AppError('Reading not found', 404);
  }

  await reading.deleteOne();
  return reading;
};

export const deleteAllReadings = async () => {
  const result = await Reading.deleteMany({});
  return {
    deletedCount: result.deletedCount,
  };
};
