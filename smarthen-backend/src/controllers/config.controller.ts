import { Request, Response, NextFunction } from 'express';
import { getConfig, updateConfig } from '../services/config.service';
import { successify } from '../utils/response.util';

export const getConfigHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await getConfig();
    successify(res, 'Configuration retrieved', config, 200);
  } catch (error) {
    next(error);
  }
};

export const updateConfigHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await updateConfig(req.body);
    successify(res, 'Configuration updated successfully', config, 200);
  } catch (error) {
    next(error);
  }
};
