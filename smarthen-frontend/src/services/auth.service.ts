import api from './api.service';
import { ApiResponse, LoginResponse } from '../types/response';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  return res.data.data;
};
