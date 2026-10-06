export interface Reading {
  _id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  gasLevel: number;
  fanState: boolean;
  bulbState: boolean;
  buzzerState: boolean;
}

export interface Config {
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  gasThreshold: number;
  fanAutoMode: boolean;
  bulbAutoMode: boolean;
  buzzerEnabled: boolean;
  feedingTimes: string[];
  deviceLastSeen: string | null;
  deviceOnline: boolean;
}

export interface Command {
  _id: string;
  command: 'fan_on' | 'fan_off' | 'bulb_on' | 'bulb_off' | 'feed_dispense';
  issuedAt: string;
  executedAt: string | null;
  status: 'pending' | 'executed' | 'failed';
  source: 'auto' | 'manual';
}

export interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}
