import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorify } from '../utils/response.util';

// Extend Express Request to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
      isHardware?: boolean;
    }
  }
}

interface JwtPayload {
  adminId: string;
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorify(res, 'No token provided', null, 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.adminId = decoded.adminId;
    next();
  } catch {
    errorify(res, 'Invalid or expired token', null, 401);
  }
};

export const authenticateHardware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.HARDWARE_API_KEY) {
    errorify(res, 'Invalid or missing API key', null, 401);
    return;
  }

  req.isHardware = true;
  next();
};

export const authenticateAny = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      req.adminId = decoded.adminId;
      next();
      return;
    } catch {
      // Fall through to hardware key check
    }
  }

  if (apiKey && apiKey === process.env.HARDWARE_API_KEY) {
    req.isHardware = true;
    next();
    return;
  }

  errorify(res, 'Authentication required', null, 401);
};
