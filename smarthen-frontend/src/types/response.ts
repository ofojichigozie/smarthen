export interface ApiResponse<T = null> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface LoginResponse {
  admin: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}
