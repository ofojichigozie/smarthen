import { Response } from 'express';

export const successify = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorify = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 400
): Response => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    data,
  });
};
