import { config } from '../config.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Query;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildUrl = (path: string, query?: Query): string => {
  const url = new URL(`${config.apiUrl}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
};

const request = async <T>(options: RequestOptions): Promise<ApiResponse<T>> => {
  const { method, path, body, query } = options;
  const url = buildUrl(path, query);

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': config.mcpServiceApiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(`Could not reach backend: ${message}`, 0);
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    const message = payload?.message ?? `Backend returned HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }

  if (!payload) {
    throw new ApiError('Backend returned an empty or non-JSON response', response.status);
  }

  return payload;
};

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const apiClient = {
  get: <T = unknown>(path: string, query?: Query): Promise<ApiResponse<T>> =>
    request<T>({ method: 'GET', path, query }),

  post: <T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
    request<T>({ method: 'POST', path, body }),

  put: <T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
    request<T>({ method: 'PUT', path, body }),

  delete: <T = unknown>(path: string): Promise<ApiResponse<T>> =>
    request<T>({ method: 'DELETE', path }),
};
