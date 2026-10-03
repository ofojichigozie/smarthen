import Config from '../models/config.model';
import { AppError } from '../middleware/error.middleware';
import { UpdateConfigInput } from '../validations/config.validation';

export const getConfig = async () => {
  let config = await Config.findOne();
  if (!config) {
    config = await Config.create({});
  }
  return config;
};

export const updateConfig = async (data: UpdateConfigInput) => {
  const config = await Config.findOne();
  if (!config) {
    throw new AppError('Configuration not found – please seed first', 404);
  }

  // Update only provided fields
  Object.keys(data).forEach((key) => {
    if (data[key as keyof UpdateConfigInput] !== undefined) {
      (config as any)[key] = data[key as keyof UpdateConfigInput];
    }
  });

  await config.save();
  return config;
};
