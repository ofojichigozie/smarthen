import { Request, Response, NextFunction } from 'express';
import { errorify } from '../utils/response.util';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', err);

  // Handle AppError instances
  if (err instanceof AppError) {
    errorify(res, err.message, null, err.statusCode);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    errorify(res, 'Validation error', err.message, 400);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    errorify(res, 'Duplicate field value', null, 409);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorify(res, 'Invalid token', null, 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorify(res, 'Token expired', null, 401);
    return;
  }

  // Default: unknown error
  errorify(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    null,
    500
  );
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  errorify(res, `Route ${req.method} ${req.originalUrl} not found`, null, 404);
};
