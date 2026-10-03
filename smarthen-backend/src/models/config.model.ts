import { Schema, model, Document } from 'mongoose';

export interface IConfig extends Document {
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  gasThreshold: number;
  fanAutoMode: boolean;
  bulbAutoMode: boolean;
  buzzerEnabled: boolean;
  feedingTimes: string[];
  deviceLastSeen: Date | null;
  deviceOnline: boolean;
}

const configSchema = new Schema<IConfig>(
  {
    temperatureMin: {
      type: Number,
      required: true,
      default: 18,
    },
    temperatureMax: {
      type: Number,
      required: true,
      default: 30,
    },
    humidityMin: {
      type: Number,
      required: true,
      default: 40,
    },
    humidityMax: {
      type: Number,
      required: true,
      default: 70,
    },
    gasThreshold: {
      type: Number,
      required: true,
      default: 200,
    },
    fanAutoMode: {
      type: Boolean,
      required: true,
      default: true,
    },
    bulbAutoMode: {
      type: Boolean,
      required: true,
      default: true,
    },
    buzzerEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    feedingTimes: {
      type: [String],
      required: true,
      default: ['02:00', '06:00', '09:00', '15:00'],
    },
    deviceLastSeen: {
      type: Date,
      default: null,
    },
    deviceOnline: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Config = model<IConfig>('Config', configSchema);

export default Config;
