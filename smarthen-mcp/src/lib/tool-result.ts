import { ApiError } from './api-client.js';

export const toolSuccess = <T>(data: T) => ({
  content: [
    {
      type: 'text' as const,
      text: JSON.stringify(data, null, 2),
    },
  ],
});

export const toolError = (error: unknown) => {
  let message: string;

  if (error instanceof ApiError) {
    message =
      error.statusCode === 0
        ? error.message
        : `Backend error (HTTP ${error.statusCode}): ${error.message}`;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = 'Unknown error';
  }

  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
};
