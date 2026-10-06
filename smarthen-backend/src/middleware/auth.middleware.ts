import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { errorify } from '../utils/response.util';

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
      isHardware?: boolean;
      isService?: boolean;
    }
  }
}

interface JwtPayload {
  adminId: string;
}

export type AuthSource = 'admin' | 'hardware' | 'service';

const verifyJwt = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return decoded.adminId;
  } catch {
    return null;
  }
};

const isServiceKey = (key: string | undefined): boolean => {
  return !!key && key === process.env.MCP_SERVICE_API_KEY;
};

const isHardwareKey = (key: string | undefined): boolean => {
  return !!key && key === process.env.HARDWARE_API_KEY;
};

export const authenticate = (sources: AuthSource[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const serviceKey = req.headers['x-service-key'] as string | undefined;

    // 1. Service account
    if (sources.includes('service') && isServiceKey(serviceKey)) {
      req.adminId = 'service:smarthen-mcp';
      req.isService = true;
      next();
      return;
    }

    // 2. Admin JWT
    if (sources.includes('admin') && authHeader?.startsWith('Bearer ')) {
      const adminId = verifyJwt(authHeader.split(' ')[1]);
      if (adminId) {
        req.adminId = adminId;
        next();
        return;
      }
    }

    // 3. Hardware key
    if (sources.includes('hardware') && isHardwareKey(apiKey)) {
      req.isHardware = true;
      next();
      return;
    }

    errorify(res, 'Authentication required', null, 401);
  };
};
