import { Request, Response, NextFunction } from 'express';
import { loginAdmin } from '../services/auth.service';
import { successify } from '../utils/response.util';

export const loginAdminHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin(email, password);
    successify(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};
