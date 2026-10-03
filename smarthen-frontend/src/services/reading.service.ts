import api from './api.service';
import { ApiResponse, PaginatedResponse } from '../types/response';
import { Reading } from '../types/models';
import { GetHistoryParams } from '../types/request';

export const getLatestReading = async (): Promise<Reading | null> => {
  const res = await api.get<ApiResponse<Reading | null>>('/readings/latest');
  return res.data.data;
};

export const getReadingsHistory = async (
  params: GetHistoryParams = {}
): Promise<PaginatedResponse<Reading>> => {
  const res = await api.get<ApiResponse<PaginatedResponse<Reading>>>('/readings/history', {
    params,
  });
  return res.data.data;
};

export const deleteReading = async (id: string): Promise<{ id: string }> => {
  const res = await api.delete<ApiResponse<{ id: string }>>(`/readings/${id}`);
  return res.data.data;
};

export const deleteAllReadings = async (): Promise<{ deletedCount: number }> => {
  const res = await api.delete<ApiResponse<{ deletedCount: number }>>('/readings');
  return res.data.data;
};
