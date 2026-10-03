import api from './api.service';
import { ApiResponse } from '../types/response';
import { Config } from '../types/models';
import { UpdateConfigRequest } from '../types/request';

export const getConfig = async (): Promise<Config> => {
  const res = await api.get<ApiResponse<Config>>('/config');
  return res.data.data;
};

export const updateConfig = async (data: UpdateConfigRequest): Promise<Config> => {
  const res = await api.put<ApiResponse<Config>>('/config', data);
  return res.data.data;
};
