import { Request, Response, NextFunction } from 'express';
import { pipeUIMessageStreamToResponse, toUIMessageStream } from 'ai';
import { streamChat } from '../services/ai.service';
import { errorify } from '../utils/response.util';

export const chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message } = req.body;

    if (typeof message !== 'string' || message.trim().length === 0) {
      errorify(res, 'message is required', null, 400);
      return;
    }

    const result = await streamChat(message);

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    next(error);
  }
};
