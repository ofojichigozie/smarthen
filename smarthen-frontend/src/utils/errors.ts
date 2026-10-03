import { AxiosError } from 'axios';

export const getMessage = (error: unknown, fallback?: string): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    if ('isAxiosError' in error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data as Record<string, unknown>;
        if (typeof data.message === 'string') {
          return data.message;
        }
        if (typeof data.error === 'string') {
          return data.error;
        }
      }
      if (axiosError.message) {
        return axiosError.message;
      }
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      // fall through to fallback
    }
  }

  return fallback ?? 'An unknown error occurred';
};
