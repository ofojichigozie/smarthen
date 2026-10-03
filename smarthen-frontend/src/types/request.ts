import { CommandType, CommandStatus } from './models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateConfigRequest {
  temperatureMin?: number;
  temperatureMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  gasThreshold?: number;
  fanAutoMode?: boolean;
  bulbAutoMode?: boolean;
  buzzerEnabled?: boolean;
  feedingTimes?: string[];
}

export interface CreateCommandRequest {
  command: CommandType;
}

export interface ExecuteCommandRequest {
  commandId: string;
  status: CommandStatus;
}

export interface GetHistoryParams {
  limit?: number;
  skip?: number;
  from?: string;
  to?: string;
}
