import api from './api.service';
import { ApiResponse, PaginatedResponse } from '../types/response';
import { Command } from '../types/models';

export const createCommand = async (command: string): Promise<Command> => {
  const res = await api.post<ApiResponse<Command>>('/commands', { command });
  return res.data.data;
};

export const getPendingCommands = async (): Promise<Command[]> => {
  const res = await api.get<ApiResponse<Command[]>>('/commands/pending');
  return res.data.data;
};

export const getCommandHistory = async (
  limit: number = 20,
  skip: number = 0
): Promise<PaginatedResponse<Command>> => {
  const res = await api.get<ApiResponse<PaginatedResponse<Command>>>('/commands/history', {
    params: { limit, skip },
  });
  return res.data.data;
};

export const deleteCommand = async (id: string): Promise<{ id: string }> => {
  const res = await api.delete<ApiResponse<{ id: string }>>(`/commands/${id}`);
  return res.data.data;
};

export const deleteAllCommands = async (): Promise<{ deletedCount: number }> => {
  const res = await api.delete<ApiResponse<{ deletedCount: number }>>('/commands');
  return res.data.data;
};
