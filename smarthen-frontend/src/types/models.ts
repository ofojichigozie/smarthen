export interface Admin {
  id: string;
  name: string;
  email: string;
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

export type CommandType = 'fan_on' | 'fan_off' | 'bulb_on' | 'bulb_off' | 'feed_dispense';

export type CommandStatus = 'pending' | 'executed' | 'failed';

export type CommandSource = 'auto' | 'manual';

export interface Command {
  _id: string;
  command: CommandType;
  issuedAt: string;
  executedAt: string | null;
  status: CommandStatus;
  source: CommandSource;
}
