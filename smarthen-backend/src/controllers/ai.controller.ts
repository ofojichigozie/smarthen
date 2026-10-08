import { Request, Response, NextFunction } from 'express';
import { pipeUIMessageStreamToResponse, toUIMessageStream, type UIMessage } from 'ai';
import { streamChat } from '../services/ai.service';
import { errorify } from '../utils/response.util';

export const chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messages } = req.body as { messages?: UIMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      errorify(res, 'messages are required', null, 400);
      return;
    }

    const result = await streamChat(messages);

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    next(error);
  }
};
