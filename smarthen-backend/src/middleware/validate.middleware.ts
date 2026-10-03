import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorify } from '../utils/response.util';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Works with both Zod v3 (error.errors) and v4+ (error.issues)
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        errorify(res, 'Validation failed', formattedErrors, 400);
        return;
      }
      next(error);
    }
  };
};
